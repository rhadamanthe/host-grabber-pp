'use strict';

// Create the menu
browser.contextMenus.create({
  id: 'hg-menu',
  title: 'Host Grabber',
  contexts: ['all']
});

browser.contextMenus.create({
  id: 'hg-menu-extract',
  parentId: 'hg-menu',
  title: 'Extract',
  contexts: ['all'],
  onclick: downloadContent
});


// Commands
browser.commands.onCommand.addListener((command) => {
  if( command === 'dl') {
    downloadContent();
  }
});


// Initialize the queues
// One is about processing links and downloads.
// The second one is for display purpose.
var processingQueue = newQueue();
var allProcessors = [];

// Initialize the dictionary
var dictionary = null;
var storageItem = browser.storage.local.get('hostUrl');
storageItem.then((res) => {
  var url = res.hostUrl || 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
  loadDictionary(url).then( function(downloadedDictionary) {
    dictionary = downloadedDictionary;
  });
});


// Functions

/**
 * Downloads the content by analyzing the source code of the current tab.
 * @returns {undefined}
 */
function downloadContent() {

  // Get the page's source code.
  // Background scripts cannot directly get it, so we ask it to our content
  // script (in the currently active tab). So we have to go through the tab API.
  browser.tabs.query({active: true, currentWindow: true}).then( tabs => {
    browser.tabs.sendMessage( tabs[0].id, {'req':'source-code'}).then( sourceAsText => {

      // Parse the source code and find the links
      var sourceDocument = new DOMParser().parseFromString(sourceAsText,'text/html');
      var processors = findWhatToProcess(sourceDocument, tabs[0].url, dictionary);

      // We get link candidates to process and/or explore
      processors.forEach(function(processor) {
        processingQueue.append(processor);
        allProcessors.push(processor);
      });
    });
  });
}


/**
 * Starts a real download and updates the link object's status on completion.
 * @param {object} linkObject An object that holds a download link and status.
 * @param {object} processor The processor that holds the link object.
 * @returns {undefined}
 */
function startDownload(linkObject, processor) {
/*
  var options = {
    conflictAction: 'uniquify',
    url: linkObject.link
  };

  var downloading = browser.downloads.download(options).then( function(downloadItemId) {
    linkObject.status = DlStatus.SUCCESS;

  }, function(error) {
    linkObject.status = DlStatus.FAILURE;
  });
*/
  console.log(linkObject.link);
}
