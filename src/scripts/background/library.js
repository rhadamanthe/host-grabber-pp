'use strict';

/**
 * Creates a default extractor.
 * @returns {object} The extractor object.
 */
function extractor() {
  return {
    xpath: xpath,
    replace: replace,
    expreg: expreg,
    def: function() {
      return [];
    }
  };
}


/**
 * Loads a dictionary from an URL.
 * @param {string} dictionaryUrl The dictionary URL.
 * @returns {promise} a promise with the dictionary (as a DOM document) in case of successful download.
 */
function loadDictionary(dictionaryUrl) {

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'document';
    xhr.open('GET', dictionaryUrl, true);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.responseXML);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };

    xhr.send(null);
  });
}


/**
 * Finds the matches in the web page, against the dictionary (host.xml file).
 * @param {object} sourceDocument The source page as a DOM document.
 * @param {string} url The URL of the current web page.
 * @param {object|array} dictionaries The DOM dictionary to use or an array of dictionaries.
 * @returns {Array} a non-null array of URLs (with no duplicate in it).
 */
function process(sourceDocument, url, dictionaries) {

  // Prepare the result
  var links = new Set();
  var theExtractor = extractor();

  // Fix the dictionaries parameter
  if (typeof dictionaries !== 'array') {
    dictionaries = [dictionaries];
  }

  // Iterate over the dictionaries
  for (var index = 0; index < dictionaries.length; index ++) {

    var dictionary = dictionaries[index];
    var tags = dictionary.documentElement.getElementsByTagName('host');
    for (var i = 0; i < tags.length; i++) {

      var urlpatterns = tags[i].getElementsByTagName('urlpattern');
      if(urlpatterns.length < 1 ) {
        console.log('Expected an URL pattern for ' + tags[i].id);
        continue;
      }

      var searchpatterns = tags[i].getElementsByTagName('searchpattern');
      if(searchpatterns.length < 1 ) {
        console.log('Expected a search pattern for ' + tags[i].id);
        continue;
      }

      var newLinks = match(
          removeCDataMarkups(urlpatterns[0].innerHTML),
          removeCDataMarkups(searchpatterns[0].innerHTML),
          sourceDocument,
          url,
          theExtractor);

      newLinks.forEach(function(newLink) {
        var fixedLink = fixRelativeLinks(newLink, url);
        links.add(fixedLink);
      });
    }
  }

  return Array.from(links);
}


/**
 * Finds the matches in the web page, against the dictionary (host.xml file).
 * @param {string} urlPattern The URL pattern, as specified in the host.xml file.
 * @param {string} searchPattern The search pattern, as specified in the host.xml file.
 * @param {object} sourceDocument The source page as a DOM document.
 * @param {string} url The URL of the current web page.
 * @param {object} extractor The extractor used to find what to download.
 * @returns {Set} a non-null set of URLs.
 */
function match(urlPattern, searchPattern, sourceDocument, url, extractor) {

  // Search images by ID
  var match = (/^\s*id\s*:\s*(.+)$/ig).exec(searchPattern);
  if(match) {
    return extractor.xpath(sourceDocument, '//img[@id=\'' + match[1].trim() + '\']/@src');
  }

  // Search images by class
  match = (/^\s*class\s*:\s*(.+)$/ig).exec(searchPattern);
  if(match) {
    return extractor.xpath(sourceDocument, '//img[@class=\'' + match[1].trim() + '\']/@src');
  }

  // Search links by XPath
  match = (/^\s*xpath\s*:\s*(.+)$/ig).exec(searchPattern);
  if(match) {
    return extractor.xpath(sourceDocument, match[1].trim());
  }

  // Deduce links from the URL pattern
  match = (/^\s*replace\s*:\s*\'(.+)\'\s*,\s*\'(.+)\'\s*$/ig).exec(searchPattern);
  if(match) {
    return extractor.replace(sourceDocument, urlPattern, match[1].trim(), match[2].trim());
  }

  // Find links in the source code with a regular expression
  match = (/^\s*expreg\s*:\s*(.+)\s*$/ig).exec(searchPattern);
  if(match) {
    return extractor.expreg(sourceDocument, match[1].trim());
  }

  // SELF: the URL pattern helps to find direct images
  var match = (/^\s*self\s*$/ig).exec(searchPattern);
  if(match) {
    return extractor.expreg(sourceDocument, urlPattern);
  }

  // No link found
  return extractor.def();
}


/**
 * Finds the matches in the web page with a XPath expression
 * @param {object} sourceDocument The source page as a DOM document.
 * @param {string} expr A XPath expression.
 * @returns {Array} a non-null array of URLs.
 */
function xpath(sourceDocument, expr) {

  var links = new Set();
  var resSet = sourceDocument.evaluate( expr, sourceDocument, null, XPathResult.ANY_TYPE, null );
  for( var res=resSet.iterateNext(); !!res; res=resSet.iterateNext()) {
    links.add(res.value);
  }

  return Array.from(links);
}


/**
 * Finds the matches in the web page by replacing a given pattern by another string.
 * @param {object} sourceDocument The source page as a DOM document.
 * @param {string} urlPattern The URL pattern, as specified in the host.xml file.
 * @param {string} toSearch The pattern to find and replace.
 * @param {string} replacement The replacement (can contain back-references to captured groups).
 * @returns {Array} a non-null array of URLs.
 */
function replace(sourceDocument, urlPattern, toSearch, replacement) {

  var links = new Set();
  var fixedUrlPattern = fixUrlPattern( urlPattern );

  var regexp = new RegExp('src\s*=\s*"(' + fixedUrlPattern + ')"', 'ig');
  var source = sourceDocument.documentElement.innerHTML;
  for( var match = regexp.exec(source); !! match; match = regexp.exec(source)) {
    var url = match[1].replace( new RegExp( toSearch, 'ig' ), replacement );
    links.add(url);
  };

  return Array.from(links);
}


/**
 * Finds the matches in the web page thanks to a regular expression.
 * @param {object} sourceDocument The source page as a DOM document.
 * @param {string} pattern The extraction pattern.
 * @returns {Array} a non-null array of URLs.
 */
function expreg(sourceDocument, pattern) {

  var links = new Set();
  var source = sourceDocument.documentElement.innerHTML;
  var fixedUrlPattern = fixUrlPattern( pattern );
  var regexp = new RegExp(fixedUrlPattern, 'ig');

  for( var match = regexp.exec(source); !! match; match = regexp.exec(source)) {
    var url = !! match[1] ? match[1] : match[0];
    links.add(url);
  };

  return Array.from(links);
}


/**
 * Fixes the URL patterns for some searches.
 * @param {string} urlPattern The URL pattern.
 * @returns {string} The URL pattern, without the ^ and $ meta-characters.
 */
function fixUrlPattern(urlPattern) {

  var fixedUrlPattern = urlPattern;
  if( fixedUrlPattern.startsWith('^')) {
    fixedUrlPattern = fixedUrlPattern.substring(1);
  }

  if( fixedUrlPattern.endsWith('$')) {
    fixedUrlPattern = fixedUrlPattern.substring(0, fixedUrlPattern.length - 1);
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
