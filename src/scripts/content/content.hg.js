'use strict';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  var response = '';
  if (request.req === 'source-code') {
    // We cannot directly pass the DOM document
    response = document.documentElement.innerHTML;
  }

  // On Chrome, it only works in tabs loaded AFTER the extension.
  // Refreshing the extension makes the messaging fail, unless we refresh the tabs.
  // In fact, content scripts are not injected in pre-existing tabs.

  return Promise.resolve(response);
});
