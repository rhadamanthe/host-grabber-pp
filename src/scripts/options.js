
/**
 * Saves the options.
 * @param {object} e The event.
 * @returns {undefined}
 */
function saveOptions(e) {
  browser.storage.local.set({
    hostUrl: document.querySelector('#host-url').value
  });
  e.preventDefault();
}


/**
 * Loads the preferences.
 * @returns {undefined}
 */
function restoreOptions() {
  var storageItem = browser.storage.local.get('hostUrl');
  storageItem.then((res) => {
    document.querySelector('#host-url').value = res.hostUrl || 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
