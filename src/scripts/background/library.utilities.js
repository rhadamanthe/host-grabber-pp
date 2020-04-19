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
    var customError = undefined;
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
        statusText: customError || this.statusText
      });
    };

    xhr.onload = function () {
      var result = asDoc ? this.responseXML : this.responseText;
      if (asDoc && !! mimeType && ! result) {
        customError = 'Invalid XML document.';
        this.onerror();

      } else if (this.status >= 200 && this.status < 300) {
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


/**
 * Builds the download options for the browser API.
 * @param {object} linkObject A link object.
 * @param {object} processor A processor object.
 * @param {integer} strategy The download strategy.
 * @param {string} dlCustomPattern The pattern for the custom download strategy.
 * @returns {object} The download options, as an object.
 */
function buildDownloadOptions(linkObject, processor, strategy, dlCustomPattern) {

  var options = {
    conflictAction: 'uniquify',
    url: linkObject.link,
    saveAs: false
  };

  // The real question is whether we download in a sub-directory
  var subDirPattern = '';
  if (strategy === DL_STRATEGY_DIR_PER_DOMAIN ) {
    subDirPattern = DL_DIR_PAGE_DOMAIN;

  } else if (strategy === DL_STRATEGY_DIR_PER_ALPHA_DATE) {
    subDirPattern = DL_DIR_DATE_YEAR + '-' + DL_DIR_DATE_MONTH + '-' + DL_DIR_DATE_DAY;

  } else if (strategy === DL_STRATEGY_DIR_PER_TREE_DATE) {
    subDirPattern = DL_DIR_DATE_YEAR + '/' + DL_DIR_DATE_MONTH + '/' + DL_DIR_DATE_DAY;

  }  else if (strategy === DL_STRATEGY_DIR_PER_PAGE_TITLE) {
    subDirPattern = DL_DIR_PAGE_TITLE;

  }  else if (strategy === DL_STRATEGY_PROMPT_USER) {
    subDirPattern = processor.promptedDirectoryName || '';

  } else if (strategy === DL_STRATEGY_CUSTOM) {
    subDirPattern = dlCustomPattern || '';
  }

  if( subDirPattern.length > 0 && ! subDirPattern.endsWith( '/' )) {
    subDirPattern += '/';
  }

  // Replace mark-ups in the sub-directory pattern
  var subDir = buildDlDirectoryFromPattern(new Date(), subDirPattern, processor);

  // When there is a sub-directory, we need to specify the file name
  if (subDir !== '') {
    var name = linkObject.link.split('/').pop().split('#')[0].split('?')[0];
    options.filename = subDir + name;
  }

  return options;
}


/**
 * Builds the download directory from a pattern.
 * @param {object} date The current date.
 * @param {string} subDirPattern The pattern to build the sub-directory path.
 * @param {object} processor The associated processor.
 * @returns {string} The full sub-directory path.
 */
function buildDlDirectoryFromPattern(date, subDirPattern, processor) {

  var res = subDirPattern;
  res = res.replace(
    DL_DIR_PAGE_DOMAIN,
    new URL(processor.originUrl).hostname.replace('www.', ''));

  res = res.replace(
    DL_DIR_PAGE_TITLE,
    processor.pageTitle.replace(/\W+/g, '_'));

  res = res.replace( DL_DIR_DATE_YEAR, date.getFullYear());
  res = res.replace( DL_DIR_DATE_MONTH, ('0' + (1 + date.getMonth())).slice(-2));
  res = res.replace( DL_DIR_DATE_HOUR, ('0' + (1 + date.getHours())).slice(-2));
  res = res.replace( DL_DIR_DATE_DAY, ('0' + date.getDate()).slice(-2));
  res = res.replace( DL_DIR_DATE_MINUTE, ('0' + date.getMinutes()).slice(-2));

  res = res.substring(0, 160);
  return res;
}


/**
 * Verifies whether a download item seems valid.
 * @param {object} downloadItem A  download item.
 * @returns {object} An error object.
 * <p>
 * If the error code is 0, then no error was found.<br />
 * Otherwise, this code is a DlStatus constant.
 * </p>
 */
function verifyDownloadedItem(downloadItem) {

  var error = { code: 0 };
  if (!! downloadItem.mime && downloadItem.mime.startsWith('text/')) {
    error.code = DlStatus.INVALID_MIME_TYPE;
    error.details = downloadItem.mime;

  } else if (!! downloadItem.fileSize
      && downloadItem.fileSize !== -1
      && downloadItem.fileSize < 3 * 1024) {
    error.code = DlStatus.UNEXPECTED_SMALL_SIZE;
  }

  return error;
}


/**
 * Builds a dictionary to download direct images.
 * <p>
 * Links to thumbnails (that end with _<code>width</code>x<code>height</code>)
 * are replaced to target full-size images.
 * </p>
 * @returns {object} A dictionary wrapper.
 */
function buildDictionaryWrapperForDirectImages() {

  // Search <a> links that end with jpg, png or gif.
  // Also consider image names that are completed by "?something".
  // Eventually, consider Wordpress images (that are often resized
  // and contain WIDTHxHEIGHT before the extension).
  var dictionaryAsString = `<?xml version="1.0" encoding="UTF-8"?>
    <root id="direct_images" version="built-in" spec="1.0">
    <host id="direct_images">
      <domain-pattern>.*</domain-pattern>
      <path-pattern>_$CURRENT$_</path-pattern>
      <search-pattern><![CDATA[expreg: <a\\s+[^>]*href="([^"]+\\.(jpg|gif|png))(\\?[^"]*)?"[^>]*>\\s*<img]]></search-pattern>
      <interceptor>replace: '_\\d+x\\d+\\.(jpg|png|gif)', '.$1'</interceptor>
    </host>
    </root>
    `;

  // Validate
  var dictionaryDocument = new DOMParser().parseFromString(dictionaryAsString,'text/xml');
  return parseAndVerifyDictionary(dictionaryDocument);
}
