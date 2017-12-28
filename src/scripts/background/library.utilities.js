'use strict';


/**
 * Loads a remote XML document from an URL.
 * @param {string} url The URL.
 * @returns {promise} a promise with the DOM document in case of successful download.
 */
function loadRemoteDocument(url) {

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'document';
    xhr.open('GET', url, true);
    xhr.overrideMimeType('application/xml');
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: this.statusText
      });
    };

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.responseXML);
      } else {
        this.onerror();
      }
    };

    xhr.send(null);
  });
}


/**
 * Fixes the URL patterns for searches.
 * @param {string} urlPattern The URL pattern.
 * @returns {string} The URL pattern, without the ^ and $ meta-characters.
 */
function fixUrlPattern(urlPattern) {

  var fixedUrlPattern = urlPattern;
  if (fixedUrlPattern.startsWith('^')) {
    fixedUrlPattern = fixedUrlPattern.substring(1);
  }

  if (fixedUrlPattern.endsWith('$')) {
    fixedUrlPattern = fixedUrlPattern.substring(0, fixedUrlPattern.length - 1);
  }

  if (! fixedUrlPattern.startsWith('(')) {
    fixedUrlPattern = '(' + fixedUrlPattern + ')';
  }

  return fixedUrlPattern;
}


/**
 * Removes CData sections.
 * @param {string} text A raw text that might be a CData section.
 * @returns {string} The fixed text.
 */
function removeCDataMarkups(text) {

  var fixedText = text;
  if( fixedText.toLowerCase().startsWith('<![cdata[')) {
    fixedText = fixedText.substring(9);
  }

  if( fixedText.endsWith(']]>')) {
    fixedText = fixedText.substring(0, fixedText.length - 3);
  }

  return fixedText;
}


/**
 * Fixes links so that relative ones are resolved as absolute links.
 * @param {string} newLink A link, that might be relative or absolute.
 * @param {string} pageUrl The current page URL.
 * @returns {string} An absolute URL.
 */
function fixRelativeLinks(newLink, pageUrl) {

  var res;
  if (newLink.indexOf('://') > 0 || newLink.indexOf('//') === 0 ) {
    res = newLink;
  } else if (newLink.indexOf('/') === 0) {
    res = new URL(pageUrl).origin + newLink;
  } else if (pageUrl.endsWith('/')) {
    res = new URL(pageUrl + newLink).toString();
  } else {
    res = new URL(pageUrl + '/' + newLink).toString();
  }

  return res;
}
