'use strict';

/* Fields */

// Initialize the queue.
var queue = newQueue(handleProcessorFn);

// Initialize the dictionary
var dictionary = null;

// Initialize the download manager
var dlManager = newDlManager(queue);

// Already visited URLs
var alreadyVisitedUrls = [];


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
  onclick: downloadContentFromCurrentTab
});

browser.contextMenus.create({
  id: 'separator-1',
  parentId: 'hg-menu',
  type: 'separator',
  contexts: ['all']
});


browser.contextMenus.create({
  id: 'hg-menu-show-dl-list',
  parentId: 'hg-menu',
  title: 'Show Downloads List',
  contexts: ['all'],
  onclick: showDownloadsList
});

browser.contextMenus.create({
  id: 'hg-menu-options',
  parentId: 'hg-menu',
  title: 'Show Options',
  contexts: ['all'],
  onclick: showOptionsPage
});


// Commands
browser.commands.onCommand.addListener((command) => {
  if (command === 'dl') {
    downloadContentFromCurrentTab();
  }
});


// Messages
browser.runtime.onMessage.addListener(request => {
  if (request.req === 'dictionary-update') {
    downloadDictionary();

  } else if (request.req === 'get-processors') {
    var history = Array.from(queue.processingHistory.values());
    sendProcessorsToDownloadView(history);

  } else if (request.req === 'remove-processor') {
    queue.remove(request.obj);

  } else if (request.req === 'restart-download') {
    request.obj.downloadLinks.forEach( function(dlLink) {
      removeFromArray(alreadyVisitedUrls, dlLink);
    });

    queue.reschedule(request.obj);
  }
});

browser.runtime.onMessageExternal.addListener(request => {
  if (request.req === 'explore-page' && typeof request.page === 'string') {
    downloadContentFromURL(request.page);
  }
});

// Restore the dictionary when the browser starts...
// ... or when the extension is installed or updated.
browser.runtime.onStartup.addListener(restoreDictionary);
browser.runtime.onInstalled.addListener(restoreDictionary);



/* Functions */

/**
 * Restores the dictionary.
 * <p>
 * If it is not saved locally, download it.
 * </p>
 *
 * @returns {undefined}
 */
function restoreDictionary() {

  browser.storage.local.get('mainDictionary').then((localDictionary) => {
    (!! localDictionary) ? (dictionary = localDictionary) : downloadDictionary();
  }, () => {
    downloadDictionary();
  });
}


/**
 * Saves the dictionary locally.
 * @returns {undefined}
 */
function saveDictionary() {

  if (!! dictionary) {
    var dictionaryVersion = dictionary.documentElement.getAttribute('version');
    var dictionarySpec = dictionary.documentElement.getAttribute('spec');
    var newXmlStr = new XMLSerializer().serializeToString(dictionary);

    browser.storage.local.set({
      mainDictionary: newXmlStr,
      mainDictionaryVersion: dictionaryVersion,
      mainDictionarySpec: dictionarySpec
    });
  }
}


/**
 * Downloads the dictionary.
 * @returns {undefined}
 */
function downloadDictionary() {

  browser.storage.local.get('dictionaryUrl').then((res) => {
    var url = res.dictionaryUrl || defaultDictionaryUrl;

    // By-pass the cache...
    url += ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();

    console.log('Loading dictionary from ' + url + '...');
    loadRemoteDocument(url, true, 'application/xml').then( function(downloadedDictionary) {
      dictionary = downloadedDictionary;
      saveDictionary();
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
 * @param {boolean} checkPreferences True to check preferences before showing the list, false to directly show the list.
 * @returns {undefined}
 */
function showDownloadsList() {
  showTab('HG ++', '/src/html/download-list.html');
}


/**
 * Downloads the content by analyzing the source code of the current tab.
 * @returns {undefined}
 */
function downloadContentFromCurrentTab() {

  // Get the page's source code.
  // Background scripts cannot directly get it, so we ask it to our content
  // script (in the currently active tab). So we have to go through the tab API.
  browser.tabs.query({active: true, currentWindow: true}).then( tabs => {
    browser.tabs.sendMessage( tabs[0].id, {req: 'source-code'}).then( sourceAsText => {
      downloadContentFromText(sourceAsText, tabs[0].url);
    });
  });
}


/**
 * Downloads the content by analyzing a given URL.
 * @param {string} url An URL to explore.
 * @returns {undefined}
 */
function downloadContentFromURL(url) {

  // Get the page's source code.
  loadRemoteDocument(url, false).then( sourceAsText => {
    downloadContentFromText(sourceAsText, url);
  }, error => {
    consolt.log('Failed to get the source code from: ' + url);
  });
}


/**
 * Downloads the content by analyzing a given source code.
 * @param {string} sourceAsText The source code to analyze.
 * @param {string} url The URL of the page.
 * @returns {undefined}
 */
function downloadContentFromText(sourceAsText, url) {

  // Open the download tab
  showDownloadsList();

  // Parse the source code and find the links
  var sourceDocument = new DOMParser().parseFromString(sourceAsText,'text/html');
  var processors = findWhatToProcess(sourceDocument, url, dictionary);

  // We get link candidates to process and/or explore
  processors.forEach(function(processor) {
    queue.append(processor);
  });

  // Send a notification to the downloads view
  sendProcessorsToDownloadView(processors);

  // Start downloading
  queue.processNextItem();
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
 * Handles the execution of a processor.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function handleProcessorFn(processor) {
  // We use this function as a proxy so that we can...
  // - Get download links.
  // - Update the view.
  handleProcessor(processor, extractor(), queue, dlManager.startDownload, updateProcessorInDownloadView, alreadyVisitedUrls);
}
