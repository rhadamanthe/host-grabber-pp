// Restore stuff
document.addEventListener('DOMContentLoaded', restoreOptions);

/**
 * Loads the preferences.
 * @returns {undefined}
 */
function restoreOptions() {

  browser.storage.local.get().then((res) => {
    document.querySelector('#dictionary-url').value = res.dictionaryUrl || defaultDictionaryUrl;
    document.querySelector('#dl-max-parallel').value = res.dlMaxParallel || defaultDlMaxParallel;
    document.querySelector('#dl-clear-completed').checked =
      res.hasOwnProperty('dlClearCompleted') ? res.dlClearCompleted : defaultDlClearCompleted;

    document.querySelector('#dl-show-view-when-dl-starts').checked =
      res.hasOwnProperty('dlShowViewWhenDlStarts') ? res.dlShowViewWhenDlStarts : defaultDlShowViewWhenDlStarts;

    document.querySelector('#dl-always-show-view-when-dl-starts').checked =
      res.hasOwnProperty('dlAlwaysShowViewWhenDlStarts') ? res.dlAlwaysShowViewWhenDlStarts : defaultDlAlwaysShowViewWhenDlStarts;
  });
}

// Save stuff
document.querySelector('#save-btn').addEventListener('click', function() {
  browser.storage.local.set({
    dictionaryUrl: document.querySelector('#dictionary-url').value
  });

  reloadDictionary();
});

var defaultListener = function() {
  browser.storage.local.set({
    dlMaxParallel: document.querySelector('#dl-max-parallel').value,
    dlClearCompleted: document.querySelector('#dl-clear-completed').checked,
    dlShowViewWhenDlStarts: document.querySelector('#dl-show-view-when-dl-starts').checked,
    dlAlwaysShowViewWhenDlStarts: document.querySelector('#dl-always-show-view-when-dl-starts').checked,
  });
}

document.querySelector('#dl-max-parallel').addEventListener('change', defaultListener);
document.querySelector('#dl-clear-completed').addEventListener('change', defaultListener);
document.querySelector('#dl-show-view-when-dl-starts').addEventListener('change', defaultListener);
document.querySelector('#dl-always-show-view-when-dl-starts').addEventListener('change', defaultListener);


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
