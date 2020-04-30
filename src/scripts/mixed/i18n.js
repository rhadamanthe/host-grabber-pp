
document.addEventListener('DOMContentLoaded', showI18nMessage);

/**
 * Updates all the text value of all the elements with a 'data-i18n' attribute.
 * @returns {undefined}
 */
function showI18nMessage() {

  document.querySelectorAll('[data-i18n]').forEach( function(item) {
    var key = item.getAttribute('data-i18n');
    if (!! key) {
      item.textContent = findAndVerifyValue(key);
    }
  });

  document.querySelectorAll('[data-i18n-tooltip]').forEach( function(item) {
    var key = item.getAttribute('data-i18n-tooltip');
    if (!! key) {
      item.title = findAndVerifyValue(key);
    }
  });

  document.querySelectorAll('[data-i18n-href]').forEach( function(item) {
    var key = item.getAttribute('data-i18n-href');
    if (!! key) {
      item.href = findAndVerifyValue(key);
    }
  });
}


/**
 * Finds and verifies a translation exists for the given key.
 * @param {string} key A translation key.
 * @returns {string} A translated value, associated with this key.
 */
function findAndVerifyValue(key) {

  var value = browser.i18n.getMessage(key);
  if (! value) {
    console.log('No value was set for i18n key "' + key + '".')
  }

  return value;
}
