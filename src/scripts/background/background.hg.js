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


// Global variables
var dictionary = null;
var extractor = {
  xpath: xpath,
  replace: replace
};

// Initialize the dictionary
var dictionary = loadDictionary();



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
    browser.tabs.sendMessage( tabs[0].id, {'req':'source-code'}).then( response => {
      process(response.content, tabs[0].url, dictionary);
    });
  });
}
