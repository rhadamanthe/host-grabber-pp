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
 * Prepares a processor to be sent to a content script.
 * <p>
 * This function's goal is to remove circular dependencies.
 * Therefore, it filters the properties to send to the script.
 * </p>
 * <p>
 * Required for Chrome.
 * </p>
 *
 * @param {object} processor A processor.
 * @returns {object} A partial copy of the processor, as a new object.
 */
function prepareProcessorForMessaging(processor) {

  var clone = {};
  clone.id = processor.id;
  clone.status = processor.status;
  clone.matchingUrl = processor.matchingUrl;
  clone.downloadLinks = [];

  processor.downloadLinks.forEach( function(dlLink) {
    var cloneLink = {};
    cloneLink.id = dlLink.id;
    cloneLink.link = dlLink.link;
    cloneLink.status = dlLink.status;
    if (!! dlLink.downloadItemId) {
      cloneLink.downloadItemId = dlLink.downloadItemId;
    }

    clone.downloadLinks.push(cloneLink);
  });

  return clone;
}


/**
 * Prepares an array of processors to be sent to a content script.
 * <p>
 * This function's goal is to remove circular dependencies.
 * Therefore, it filters the properties to send to the script.
 * </p>
 * <p>
 * Required for Chrome.
 * </p>
 *
 * @param {object} processors An array of processors.
 * @returns {object} A partial copy of the processors, as a new array of new objects.
 */
function prepareProcessorsForMessaging(processors) {

  var clones = [];
  processors.forEach( function(processor) {
    var clone = prepareProcessorForMessaging(processor);
    clones.push(clone);
  });

  return clones;
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
 * <p>
 * Precondition: we already know the page URL matches
 * the domain (or domain pattern).
 * </p>
 *
 * @param {string} pageUrl The page's URL.
 * @param {string|RegExp} domain The domain or a domain pattern.
 * @param {string} pathPattern The path pattern.
 * @param {string} hostId The host ID (for error reporting).
 * @returns {array} An array of objects.
 */
function buildUrlPatterns(pageUrl, domain, pathPattern, hostId) {

  var res = [];
  var domainIsRegExp = domain instanceof RegExp;
  var domainMatch = domainIsRegExp ? null : domain.match(globalDomainPattern);
  if (domain !== globalCurrent
        && ! domainIsRegExp
        && (! domainMatch || domainMatch.length === 0)) {
    console.log('Invalid domain for ' + hostId);

  } else if (pathPattern.startsWith('/') || pathPattern.startsWith('^') || pathPattern.endsWith('$')) {
    console.log('Invalid path pattern for ' + hostId);

  } else {
    // Deal with global links
    const esc = '[^<>"]';

    // Deal with the current page
    if (domain === globalCurrent) {
      domain = new URL(pageUrl).hostname;
    }

    // The base pattern covers HTTP, HTTPS, www. and sub-domains URLs
    var basePattern = buildDomainPattern(domain);
    var extraPathPattern = pathPattern
        .replace(/\.\+/, esc + '+')
        .replace(/\.\*/, esc + '*')
        .replace(/\.(\{\d+(,\d*)?\})/, esc + '$1')
        .replace('&dot;', '.')
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
 * @param {string|RegExp} domain A domain definition, as stated in a dictionary.
 * @returns {string} A pattern for a regular expression.
 */
function buildDomainPattern(domain) {

  if (domain instanceof RegExp) {
    const esc = '[^<>"/]';
    domain = String(domain);
    domain = domain.substring(1, domain.length - 1);
    domain = domain
      .replace(/\\\./, '&escaped-dot;')
      .replace(/\.\+/, esc + '+')
      .replace(/\.\*/, esc + '*')
      .replace(/\.(\{\d+(,\d*)?\})/, esc + '$1')
      .replace('&dot;', '.')
      .replace('&escaped-dot;', '\\.')
      .replace('&lt;', '<')
      .replace('&gt;', '>')
      .replace('&amp;', '&');

  } else {
    domain = domain.replace('.', '\\.')
  }

  return 'https?://([-\\w]+\\.)*' + domain;
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
