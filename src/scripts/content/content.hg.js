'use strict';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  var response = '';
  if (request.req === 'source-code') {
    // We cannot directly pass the DOM document
    response = document.documentElement.innerHTML;
  }

  // Use sendResponse as it works on both Firefox and Chrome.
  // Returning the promise instead of 'true' always works on Firefox.
  // On Chrome, it only works in tabs loaded AFTER the extension.
  // Refreshing the extension makes the messaging fail, unless we refresh the tabs.
  //sendResponse(Promise.resolve(response));
  //return false;

  return Promise.resolve(response);
});
