'use strict';

/**
 * Creates a default extractor.
 * @returns {object} The extractor object.
 */
function extractor() {
  var ext = {
    expreg: expreg,
    replace: replace,
    self: self,
    xpath: xpath
  };


  /**
   * Builds an array with the right link by replacing a given pattern by another string.
   * @param {string} url The URL found in the current source page.
   * @param {string} toSearch The pattern to find and replace.
   * @param {string} replacement The replacement (can contain back-references to captured groups).
   * @returns {Array} An array with a single URL, deduced from the original one.
   */
  function replace(url, toSearch, replacement) {

    var deducedUrl = url.replace( new RegExp( toSearch, 'ig' ), replacement );
    return [deducedUrl];
  }


  /**
   * Builds the array of download links when the found URL is the right one.
   * @param {string} url The URL.
   * @returns {Array} An array with this URL.
   */
  function self(url) {
    return [url];
  }


  /**
   * Finds the matches in the web page with a XPath expression
   * @param {object} sourceDocument The source page as a DOM document.
   * @param {string} expr A XPath expression.
 * @returns {array} A non-null array of URLs.
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
   * Finds the matches in the web page thanks to a regular expression.
   * @param {object} sourceDocument The source page as a DOM document.
   * @param {string} pattern The extraction pattern.
   * @returns {Array} a non-null array of URLs.
   */
  function expreg(sourceDocument, pattern) {

    var links = new Set();
    var source = sourceDocument.documentElement.innerHTML;
    var regexp = new RegExp(pattern, 'ig');

    for( var match = regexp.exec(source); !! match; match = regexp.exec(source)) {
      var url = !! match[1] ? match[1] : match[0];
      links.add(url);
    };

    return Array.from(links);
  }


  // Return the created object
  return ext;
}
