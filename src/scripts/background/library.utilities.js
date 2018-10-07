'use strict';


/**
 * Loads a remote XML document from an URL.
 * @param {string} url The URL.
 * @param {boolean} asDoc True if the result should be a DOM document, false to get text.
 * @param {string} mimeType The MIME type (optional).
 * @returns {promise} a promise with the DOM document in case of successful download.
 */
function loadRemoteDocument(url, asDoc = true, mimeType) {

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    if (asDoc) {
      xhr.responseType = 'document';
    }

    if (!! mimeType) {
      xhr.overrideMimeType(mimeType);
    }

    xhr.open('GET', url, true);
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: this.statusText
      });
    };

    xhr.onload = function () {
      var result = asDoc ? this.responseXML : this.responseText;
      if (this.status >= 200 && this.status < 300) {
        resolve(result);
      } else {
        this.onerror();
      }
    };

    xhr.send(null);
  });
}


/**
 * Fixes links so that relative ones are resolved as absolute links.
 * @param {string} newLink A link, that might be relative or absolute.
 * @param {string} pageUrl The current page URL.
 * @returns {string} An absolute URL.
 */
function fixRelativeLinks(newLink, pageUrl) {

  var res = new URL(newLink, pageUrl).toString();
  return res;
}


/**
 * Generates a UUID.
 * <p>
 * Found at https://gist.github.com/jcxplorer/823878
 * </p>
 * @returns {string} A UUID.
 */
function uuid() {

  var uuid = '', i, random;
  for (i=0; i<32; i++) {
    random = Math.random() * 16 | 0;

    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return uuid;
}


/**
 * Removes an item from an array.
 * @param {array} array An array.
 * @param {object} item An item.
 * @returns {boolean} True if the elements was removed from the array, false it was not found.
 */
function removeFromArray(array, item) {

  var index = array.indexOf(item);
  var wasPresent = index > -1;
  if (wasPresent) {
    array.splice(index, 1);
  }

  return wasPresent;
}


/**
 * Builds URL patterns for a given domain.
 * @param {string} pageUrl The page's URL.
 * @param {string} domain The domain.
 * @param {string} pathPattern The path pattern.
 * @param {string} hostId The host ID (for error reporting).
 * @returns {array} An array of objects.
 */
function buildUrlPatterns(pageUrl, domain, pathPattern, hostId) {

  var res = [];
  var domainMatch = domain.match(domainPattern);
  if (domain !== exploreCurrentPage &&
      (! domainMatch || domainMatch.length === 0)) {
    console.log('Invalid domain for ' + hostId);

  } else if (pathPattern.startsWith('/') || pathPattern.startsWith('^') || pathPattern.endsWith('$')) {
    console.log('Invalid path pattern for ' + hostId);

  } else {
    // Deal with global links
    const esc = '[^<>"]';

    // Deal with the current domain
    if (domain === exploreCurrentPage) {
      domain = new URL(pageUrl).hostname;
    }

    // The base pattern covers HTTP, HTTPS, www. and sub-domains URLs
    var basePattern = buildDomainPattern(domain);
    var extraPathPattern = pathPattern
        .replace(/\.\+/, esc + '+')
        .replace(/\.\*/, esc + '*')
        .replace(/\.(\{\d+(,\d*)?\})/, esc + '$1')
        .replace('&dot', '.')
        .replace('&lt;', '<')
        .replace('&gt;', '>')
        .replace('&amp;', '&');

    res.push({ pattern: '"(' + basePattern + '/' + extraPathPattern + ')"', excludeHost: false});

    // Consider relative and absolute links on a given domain
    if (pageUrlMatches(pageUrl, basePattern)) {
      res.push({ pattern: 'src\s*=\s*"(/?[^:"]*' + extraPathPattern + ')"', excludeHost: true });
      res.push({ pattern: 'href\s*=\s*"(/?[^:"]*' + extraPathPattern + ')"', excludeHost: true });
      res.push({ pattern: 'data-src\s*=\s*"(/?[^:"]*' + extraPathPattern + ')"', excludeHost: true });
    }
  }

  return res;
}


/**
 * Builds a regular expression pattern from a domain definition.
 * <p>
 * This includes HTTP, HTTPS, www. and sub-domains.
 * </p>
 *
 * @param {string} domain A domain definition, as stated in a dictionary.
 * @returns {string} A pattern for a regular expression.
 */
function buildDomainPattern(domain) {
  return 'https?://([-\\w]+\\.)*' + domain.replace('.', '\\.');
}


/**
 * Verifies a page URL matches a domain pattern.
 * @param {string} pageUrl A page URL.
 * @param {string} domainPattern A domain pattern.
 * @returns {boolean} True if this page belongs to the domain, false otherwise.
 */
function pageUrlMatches(pageUrl, domainPattern) {
  return pageUrl.match( '^' + domainPattern + '($|/).*');
}
