'use strict';

browser.runtime.onMessage.addListener(request => {
  var response = '';
  if(request.req === 'source-code') {
    // We cannot directly pass the DOM document
    response = document.documentElement.innerHTML;
  }

  return Promise.resolve(response);
});
