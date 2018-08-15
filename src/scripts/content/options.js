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

    document.querySelector('#automatic-dictionary-update').checked =
      res.hasOwnProperty('automaticallyUpdateDictionary') ? res.automaticallyUpdateDictionary : defaultAutomaticallyUpdateDictionary;

    document.querySelector('#dl-show-view-when-dl-starts').checked =
      res.hasOwnProperty('dlShowViewWhenDlStarts') ? res.dlShowViewWhenDlStarts : defaultDlShowViewWhenDlStarts;

    document.querySelector('#dl-cache-download-links').checked =
      res.hasOwnProperty('dlCacheDownloadLinks') ? res.dlCacheDownloadLinks : defaultDlCacheDownloadLinks;

    document.querySelector('#dl-always-show-view-when-dl-starts').checked =
      res.hasOwnProperty('dlAlwaysShowViewWhenDlStarts') ? res.dlAlwaysShowViewWhenDlStarts : defaultDlAlwaysShowViewWhenDlStarts;

    document.querySelector('#remove-successful-dl-from-native-dl-view').checked =
      res.hasOwnProperty('hideSuccessfulDownloadItems') ? res.hideSuccessfulDownloadItems : defaultHideSuccessfulDownloadItems;
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
    automaticallyUpdateDictionary: document.querySelector('#automatic-dictionary-update').checked,
    dlCacheDownloadLinks: document.querySelector('#dl-cache-download-links').checked,
    hideSuccessfulDownloadItems: document.querySelector('#remove-successful-dl-from-native-dl-view').checked
  });
}

document.querySelector('#dl-max-parallel').addEventListener('change', defaultListener);
document.querySelector('#dl-clear-completed').addEventListener('change', defaultListener);
document.querySelector('#dl-show-view-when-dl-starts').addEventListener('change', defaultListener);
document.querySelector('#dl-always-show-view-when-dl-starts').addEventListener('change', defaultListener);
document.querySelector('#automatic-dictionary-update').addEventListener('change', defaultListener);
document.querySelector('#dl-cache-download-links').addEventListener('change', defaultListener);
document.querySelector('#remove-successful-dl-from-native-dl-view').addEventListener('change', defaultListener);


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

document.querySelector('#clear-cache-btn').addEventListener('click', function() {
  browser.runtime.sendMessage({'req':'clear-already-visited-urls'});
});


browser.runtime.onMessage.addListener(request => {
  if (request.req === 'dictionary-reload-cb') {
    if (request.status === 'ok') {
      document.querySelector('#dictionary-url').className = 'updated-ok';
    } else if (request.status === 'us') {
      document.querySelector('#dictionary-url').className = 'updated-us';
    } else {
      document.querySelector('#dictionary-url').className = 'updated-ko';
    }

    setTimeout( function() {
      document.querySelector('#dictionary-url').className = '';
    }, 5000);
  }
});
