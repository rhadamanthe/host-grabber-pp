'use strict';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  var response = '';
  if (request.req === 'source-code') {
    // We cannot directly pass the DOM document
    response = document.documentElement.innerHTML;
  }

  else if( request.req === 'prompt-for-dl-directory' ) {
    response = prompt(
      'Enter the directory name or path.\n' +
      'It can contain \'/\' and the tags supported by the extension (e.g. %domain%).',
      request.lastPrompted);
  }

  // On Chrome, it only works in tabs loaded AFTER the extension.
  // Refreshing the extension makes the messaging fail, unless we refresh the tabs.
  // In fact, content scripts are not injected in pre-existing tabs.

  return Promise.resolve(response);
});
