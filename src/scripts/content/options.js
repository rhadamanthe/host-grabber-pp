// Restore stuff
document.addEventListener('DOMContentLoaded', restoreOptions);

/**
 * Loads the preferences.
 * @returns {undefined}
 */
function restoreOptions() {

  browser.storage.local.get().then((res) => {
    document.querySelector('#dictionary-url').value = res.dictionaryUrl || defaultDictionaryUrl;
    document.querySelector('#dl-strategy-custom-pattern').value = res.dlStrategyCustomPattern || defaultDlStrategyCustomPattern;
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

    document.querySelector('#dl-prefix-filenames-with-counter').checked =
      res.hasOwnProperty('dlPrefixFilenamesWithCounter') ? res.dlPrefixFilenamesWithCounter : defaultDlPrefixFilenamesWithCounter;

    document.querySelector('#remove-successful-dl-from-native-dl-view').checked =
      res.hasOwnProperty('hideSuccessfulDownloadItems') ? res.hideSuccessfulDownloadItems : defaultHideSuccessfulDownloadItems;

    var dlStrategy = res.hasOwnProperty('dlStrategy') ? res.dlStrategy : defaultDlStrategy;
    switch (dlStrategy) {
    case DL_STRATEGY_DIR_PER_DOMAIN:
      document.querySelector('#dl-strategy-by-domain').checked = true;
      break;
    case DL_STRATEGY_DIR_PER_ALPHA_DATE:
      document.querySelector('#dl-strategy-by-alpha-date').checked = true;
      break;
    case DL_STRATEGY_DIR_PER_TREE_DATE:
      document.querySelector('#dl-strategy-by-tree-date').checked = true;
      break;
    case DL_STRATEGY_DIR_PER_PAGE_TITLE:
      document.querySelector('#dl-strategy-by-page-title').checked = true;
      break;
    case DL_STRATEGY_CUSTOM:
      document.querySelector('#dl-strategy-custom').checked = true;
      break;
    case DL_STRATEGY_PROMPT_USER:
      document.querySelector('#dl-strategy-prompt-user').checked = true;
      break;
    default:
      document.querySelector('#dl-strategy-default').checked = true;
      break;
    }
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
    dlPrefixFilenamesWithCounter: document.querySelector('#dl-prefix-filenames-with-counter').checked,
    dlCacheDownloadLinks: document.querySelector('#dl-cache-download-links').checked,
    automaticallyUpdateDictionary: document.querySelector('#automatic-dictionary-update').checked,
    hideSuccessfulDownloadItems: document.querySelector('#remove-successful-dl-from-native-dl-view').checked,
    dlStrategy: parseInt(document.querySelector('input[name="dl-strategy"]:checked').value)
  });
}

// Callbacks
document.querySelector('#dl-max-parallel').addEventListener('change', defaultListener);
document.querySelector('#dl-clear-completed').addEventListener('change', defaultListener);
document.querySelector('#dl-show-view-when-dl-starts').addEventListener('change', defaultListener);
document.querySelector('#dl-prefix-filenames-with-counter').addEventListener('change', defaultListener);
document.querySelector('#dl-always-show-view-when-dl-starts').addEventListener('change', defaultListener);
document.querySelector('#dl-cache-download-links').addEventListener('change', defaultListener);
document.querySelector('#automatic-dictionary-update').addEventListener('change', defaultListener);
document.querySelector('#remove-successful-dl-from-native-dl-view').addEventListener('change', defaultListener);
document.querySelectorAll('input[name="dl-strategy"]').forEach(function(radioButton) {
  radioButton.addEventListener('change', defaultListener);
});

document.querySelector('#save-dl-pattern-btn').addEventListener('click', function() {
  browser.storage.local.set({
    dlStrategyCustomPattern: document.querySelector('#dl-strategy-custom-pattern').value
  });

  document.querySelector('#save-dl-pattern-btn').className = 'updated-ok';
  setTimeout( function() {
    document.querySelector('#save-dl-pattern-btn').className = '';
  }, 3000);
});

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

  else if (request.req === 'clear-already-visited-urls-cb') {
    document.querySelector('#clear-cache-btn').className = 'updated-ok';
    setTimeout( function() {
      document.querySelector('#clear-cache-btn').className = '';
    }, 3000);
  }
});
