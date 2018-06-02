'use strict';

/* Fields */

// Initialize the queue.
var queue = newQueue(handleProcessorFn);

// Initialize the dictionary
var dictionary = null;


/* Default actions */

// Create the menus
browser.contextMenus.create({
  id: 'hg-menu',
  title: 'Host Grabber',
  contexts: ['all']
});

browser.contextMenus.create({
  id: 'hg-menu-download',
  parentId: 'hg-menu',
  title: 'Extract and Download',
  contexts: ['all'],
  onclick: downloadContent
});
/*
browser.contextMenus.create({
  id: 'hg-menu-find-links',
  parentId: 'hg-menu',
  title: 'Find Links',
  contexts: ['all'],
  onclick: downloadContent
});
*/
browser.contextMenus.create({
  id: 'hg-menu-show-dl-list',
  parentId: 'hg-menu',
  title: 'Show Downloads List',
  contexts: ['all'],
  onclick: showDownloadsList
});


// Commands
browser.commands.onCommand.addListener((command) => {
  if (command === 'dl') {
    downloadContent();
  }
});


// Messages
browser.runtime.onMessage.addListener(request => {
  if (request.req === 'dictionary-update') {
    reloadDictionary();

  } else if (request.req === 'get-processors') {
    var history = Array.from(queue.processingHistory.values());
    sendProcessorsToDownloadView(history);

  } else if (request.req === 'remove-processor') {
    queue.remove(request.obj);

  } else if (request.req === 'restart-download') {
    queue.reschedule(request.obj);
  }
});

// Download the dictionary when the browser starts...
// ... or when the extension is installed or updated.
browser.runtime.onStartup.addListener(reloadDictionary);
browser.runtime.onInstalled.addListener(reloadDictionary);



/* Functions */

/**
 * Reloads the dictionary.
 * @returns {undefined}
 */
function reloadDictionary() {

  browser.storage.local.get('dictionaryUrl').then((res) => {
    var url = res.dictionaryUrl || 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
    console.log('Loading dictionary from ' + url + '...');
    loadRemoteDocument(url, 'application/xml').then( function(downloadedDictionary) {
      dictionary = downloadedDictionary;
      notifyDictionaryReload('ok');

    }, function(details) {
      notifyDictionaryReload('ko');
      console.log('Dictionary could not be loaded from ' + url + '.');
      console.log(details);
    });
  });
}


/**
 * Notifies a dictionary reload to the options page (provided it is open).
 * @param {string} status The status ('ok' or 'ko').
 * @returns {undefined}
 */
function notifyDictionaryReload(status) {

  browser.tabs.query({ title: 'Options - HG ++' }).then( function(tabs) {
    if (tabs.length > 0) {
      browser.tabs.sendMessage(tabs[0].id, {req: 'dictionary-reload-cb', status: status});
    }
  });
}


/**
 * Shows the download list.
 * @returns {undefined}
 */
function showDownloadsList() {
  showTab('HG ++', '/src/html/download-list.html');
}


/**
 * Downloads the content by analyzing the source code of the current tab.
 * @returns {undefined}
 */
function downloadContent() {

  // Open the download tab (first!)
  showDownloadsList();

  // Get the page's source code.
  // Background scripts cannot directly get it, so we ask it to our content
  // script (in the currently active tab). So we have to go through the tab API.
  browser.tabs.query({active: true, currentWindow: true}).then( tabs => {
    browser.tabs.sendMessage( tabs[0].id, {req: 'source-code'}).then( sourceAsText => {

      // Parse the source code and find the links
      var sourceDocument = new DOMParser().parseFromString(sourceAsText,'text/html');
      var processors = findWhatToProcess(sourceDocument, tabs[0].url, dictionary);

      // We get link candidates to process and/or explore
      processors.forEach(function(processor) {
        queue.append(processor);
      });

      // Send a notification to the downloads view
      sendProcessorsToDownloadView(processors);

      // Start downloading
      queue.processNextItem();
    });
  });
}


/**
 * Sends processors to the download view.
 * @param {array} processors An array of processors.
 * @returns {undefined}
 */
function sendProcessorsToDownloadView(processors) {
  browser.tabs.query({ title: 'HG ++' }).then( function(tabs) {
    if (tabs.length > 0) {
      browser.tabs.sendMessage(tabs[0].id, {req: 'new-processors', obj: processors});
    }
  });
}


/**
 * Updates a processor in the download view.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function updateProcessorInDownloadView(processor) {
  browser.tabs.query({ title: 'HG ++' }).then( function(tabs) {
    if (tabs.length > 0) {
      browser.tabs.sendMessage(tabs[0].id, {req: 'update-processor', obj: processor});
    }
  });
}


/**
 * Starts a real download and updates the link object's status on completion.
 * @param {object} linkObject An object that holds a download link and status.
 * @param {object} processor The processor that holds the link object.
 * @returns {undefined}
 */
function startDownload(linkObject, processor) {

  var options = {
    conflictAction: 'uniquify',
    url: linkObject.link,
    saveAs: false
  };

  var downloading = browser.downloads.download(options).then( function(downloadItemId) {
    // Update the status
    linkObject.status = DlStatus.SUCCESS;
    linkObject.downloadItemId = downloadItemId;
    updateProcessorInDownloadView(processor);

    // Process the next item
    queue.processNextItem();

  }, function(error) {
    // Update the status
    linkObject.status = DlStatus.FAILURE;
    updateProcessorInDownloadView(processor);

    // Process the next item
    queue.processNextItem();
  });
}


/**
 * Handles the execution of a processor.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function handleProcessorFn(processor) {
  // We use this function as a proxy so that we can...
  // Get download links
  // Update the view
  handleProcessor(processor, extractor(), queue, startDownload, updateProcessorInDownloadView);
}
