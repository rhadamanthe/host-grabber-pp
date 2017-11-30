'use strict';

browser.runtime.onMessage.addListener(request => {
  var response = '';
  if(request.req === 'source-code') {
    response = document.documentElement;
  }

  return Promise.resolve({content: response});
});
