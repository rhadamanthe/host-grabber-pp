// Restore stuff
document.addEventListener('DOMContentLoaded', restoreOptions);
const defaultUrl = 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';

/**
 * Loads the preferences.
 * @returns {undefined}
 */
function restoreOptions() {

  browser.storage.local.get('dictionaryUrl').then((res) => {
    document.querySelector('#dictionary-url').value = res.dictionaryUrl || defaultUrl;
  });

  browser.storage.local.get('dlClearCompleted').then((res) => {
    document.querySelector('#dl-clear-completed').checked = res.dlClearCompleted || false;
  });

  browser.storage.local.get('dlMaxParallel').then((res) => {
    document.querySelector('#dl-max-parallel').value = res.dlMaxParallel || 3;
  });
}

// Save stuff
document.querySelector('#dl-max-parallel').addEventListener('change', function() {
  browser.storage.local.set({
    dlMaxParallel: document.querySelector('#dl-max-parallel').value
  });
});

document.querySelector('#dl-clear-completed').addEventListener('change', function() {
  browser.storage.local.set({
    dlClearCompleted: document.querySelector('#dl-clear-completed').checked
  });
});

document.querySelector('#save-btn').addEventListener('click', function() {
  browser.storage.local.set({
    dictionaryUrl: document.querySelector('#dictionary-url').value
  });

  reloadDictionary();
});


// Callbacks

/**
 * Asks the background content to reload the dictionary.
 * @returns {undefined}
 */
function reloadDictionary() {
  browser.runtime.sendMessage({'req':'dictionary-update'});
}

document.querySelector('#reload-btn').addEventListener('click', reloadDictionary);
document.querySelector('#restore-btn').addEventListener('click', function() {
  document.querySelector('#dictionary-url').value = defaultUrl;
  browser.storage.local.set({
    dictionaryUrl: defaultUrl
  });

  reloadDictionary();
});


browser.runtime.onMessage.addListener(request => {
  if (request.req === 'dictionary-reload-cb') {
    if (request.status === 'ok') {
      document.querySelector('#dictionary-url').className = 'updated-ok';
    } else {
      document.querySelector('#dictionary-url').className = 'updated-ko';
    }

    setTimeout( function() {
      document.querySelector('#dictionary-url').className = '';
    }, 5000);
  }
});
