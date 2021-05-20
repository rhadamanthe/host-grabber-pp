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
    xpath: xpath,
    cssQuery: cssQuery
  };


  /**
   * Builds an array with the right link by replacing a given pattern by another string.
   * @param {string} url The URL found in the current source page.
   * @param {string} toSearch The pattern to find and replace.
   * @param {string} replacement The replacement (can contain back-references to captured groups).
   * @returns {Map} A map with one element, whose key is the deduced link and the value is empty.
   */
  function replace(url, toSearch, replacement) {

    var deducedUrl = url.replace( new RegExp( toSearch, 'ig' ), replacement );
    return new Map([[deducedUrl, '']]);
  }


  /**
   * Builds the array of download links when the found URL is the right one.
   * @param {string} url The URL.
   * @returns {Map} A map with one element, whose key is the original link and the value is empty.
   */
  function self(url) {
    return new Map([[url, '']]);
  }


  /**
   * Finds the matches in the web page with a XPath expression
   * @param {object} sourceDocument The source page as a DOM document.
   * @param {string} expr A XPath expression to find a XML element.
   * @param {string} linkAttr The link attribute to get on the found nodes.
   * @param {string} nameAttr The name attribute to get on the found nodes (optional).
   * @returns {map} A (possibly) empty map with links as keys and optional names as values.
   */
  function xpath(sourceDocument, expr, linkAttr, nameAttr) {

    var links = new Map();
    var resSet = sourceDocument.evaluate( expr, sourceDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
    for( var node=resSet.iterateNext(); !!node; node=resSet.iterateNext()) {
      var link = node.getAttribute(linkAttr);
      var name = node.getAttribute(nameAttr) || '';
      links.set(link, name);
    }

    return links;
  }


  /**
   * Finds the matches in the web page thanks to a regular expression.
   * @param {object} sourceDocument The source page as a DOM document.
   * @param {string} pattern The extraction pattern.
   * @returns {map} A (possibly) empty map with links as keys and optional names as values.
   */
  function expreg(sourceDocument, pattern) {

    var links = new Map();
    var source = sourceDocument.documentElement.innerHTML;
    var regexp = new RegExp(pattern, 'ig');

    for( var match = regexp.exec(source); !! match; match = regexp.exec(source)) {
      var url = !! match[1] ? match[1] : match[0];
      links.set(url, '');
    };

    return links;
  }


  /**
   * Finds the matches in the web page with a CSS Query.
   * @param {object} sourceDocument The source page as a DOM document.
   * @param {string} query A CSS query to select DOM elements.
   * @param {string} linkAttr The link attribute to get on the found nodes.
   * @param {string} nameAttr The name attribute to get on the found nodes (optional).
   * @returns {map} A (possibly) empty map with links as keys and optional names as values.
   */
  function cssQuery(sourceDocument, query, linkAttr, nameAttr) {
    query = query.replace( '&gt;', '>' );

    var links = new Map();
    sourceDocument.querySelectorAll(query).forEach( function(node) {
      var link = node.getAttribute(linkAttr);
      var name = node.getAttribute(nameAttr) || '';
      links.set(link, name);
    });

    return links;
  }


  // Return the created object
  return ext;
}
