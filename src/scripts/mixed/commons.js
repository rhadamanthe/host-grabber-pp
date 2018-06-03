// Default values for preferences

const defaultDictionaryUrl = 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
const defaultDlClearCompleted = false;
const defaultDlMaxParallel = 3;


// Functions that can be used in both content and background scripts.

/**
 * Shows a tab, if it exists, or creates it.
 * @param {string} tabTitle The title of the tab to find.
 * @param {string} tabUrl The URL to open in a new tab if it does not exist.
 * @returns {undefined}
 */
function showTab(tabTitle, tabUrl) {

  browser.tabs.query({ title: tabTitle }).then( function(tabs) {
    if (tabs.length === 0) {
      openTab(tabUrl);
    } else {
      browser.tabs.update(tabs[0].id, {active: true});
    }
  });
}


/**
 * Opens an URL in a new tab.
 * @param {string} tabUrl The URL to open in a new tab.
 * @returns {undefined}
 */
function openTab(tabUrl) {

  // Open it next to the current tab
  browser.tabs.query({active: true}).then( function(tabs) {
    browser.tabs.create({
      openerTabId: tabs[0].id,
      url: tabUrl
    });
  });
}
