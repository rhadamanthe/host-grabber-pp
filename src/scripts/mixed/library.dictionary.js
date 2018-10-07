// This file is made so that it can be executed alone.
// No dependency to any other script.

const domainPattern = /^\w[-\w\.]*\w$/;
const exploreCurrentPage = '_$CURRENT$_';


/**
 * Parses and verifies the dictionary.
 * @param {object} dictionaryDocument A DOM document.
 * @returns {object} An object with items and errors.
 */
function parseAndVerifyDictionary(dictionaryDocument) {

  var result = {};
  result.errors = [];
  result.items = [];

  // Verify the root element
  if (!dictionaryDocument.documentElement.getAttribute('version')) {
    result.errors.push('The dictionary element must have a \'version\' attribute.');
  }

  if (!dictionaryDocument.documentElement.getAttribute('spec')) {
    result.errors.push('The dictionary element must have a \'spec\' attribute.');
  }

  if (!dictionaryDocument.documentElement.getAttribute('id')) {
    result.errors.push('The dictionary element must have an \'ID\' attribute.');
  }

  // Verify hosts
  var foundIds = [];
  getElementChildren(dictionaryDocument.documentElement).forEach( function(elt) {
    if (elt.tagName !== 'host') {
      result.errors.push('An unknown tag was found in the dictionary: ' + elt.tagName);
      return;
    }

    if (!elt.getAttribute('id')) {
      result.errors.push('A host without an ID was found.');
      return;
    }

    var id = elt.getAttribute('id');
    if (foundIds.indexOf(id) !== -1) {
      result.errors.push('A same ID is used by several hosts in the dictionary: ' + id);
      return;
    }

    foundIds.push(id);
    var obj = parseAndVerifyDictionaryItem(elt);
    result.items.push(obj);
    obj.errors.forEach( function(error) {
      result.errors.push('[' + obj.id + '] ' + error);
    });
  });

  return result;
}


/**
 * Parses and verifies a dictionary item.
 * @param {object} domElement A DOM element.
 * @returns {object} An object with items and errors.
 */
function parseAndVerifyDictionaryItem(domElement) {

  // Prepare the result
  var result = {};
  result.errors = [];
  result.interceptors1 = [];
  result.interceptors2 = [];
  result.id = domElement.getAttribute('id');

  // Parse children nodes
  var current = '';
  var loopCount = 0;
  getElementChildren(domElement).forEach( function(elt) {
    var tempErrors = [];

    // Domain
    if (elt.tagName === 'domain') {
      var domain = elt.textContent.trim();
      if (loopCount !== 0) {
        tempErrors.push('A domain was found at an invalid position.');
      }

      if (domain !== exploreCurrentPage && !domain.match(domainPattern)) {
        tempErrors.push('Invalid domain: ' + domain);
      }

      if (tempErrors.length === 0) {
        result.domain = domain;
        current = 'domain';
      }
    }

    // Interceptor
    else if (elt.tagName === 'interceptor') {
      var interceptor = elt.textContent.trim();
      if (current !== 'interceptor1' && current !== 'interceptor2' && current !== 'search-pattern' && current !== 'path-pattern') {
        tempErrors.push('An interceptor was found at an invalid position.');
      }

      if (!interceptor.match(ExtMethods.REPLACE.pattern)) {
        tempErrors.push('Invalid interceptor: ' + interceptor);
      }

      if (tempErrors.length === 0) {
        var match = ExtMethods.REPLACE.pattern.exec(interceptor);
        var interceptor = {replace: match[1].trim(), by: match[2].trim()};
        ExtMethods.REPLACE.pattern.lastIndex = 0;

        if (current === 'interceptor1' || current === 'path-pattern') {
          result.interceptors1.push(interceptor);
          current = 'interceptor1';
        } else {
          result.interceptors2.push(interceptor);
          current = 'interceptor2';
        }
      }
    }

    // Path pattern
    else if (elt.tagName === 'path-pattern') {
      var pathPattern = elt.textContent.trim();
      if (current !== 'domain') {
        tempErrors.push('A path pattern was found at an invalid position.');
      }

      if (pathPattern.startsWith('/')) {
        tempErrors.push('A path pattern cannot start with \'/\'.');
      }

      if (pathPattern.startsWith('^')) {
        tempErrors.push('A path pattern cannot start with \'^\'.');
      }

      if (pathPattern.endsWith('$')) {
        tempErrors.push('A path pattern cannot end with \'$\'.');
      }

      if (tempErrors.length === 0) {
        result.pathPattern = pathPattern;
        current = 'path-pattern';
      }
    }

    // Search pattern
    else if (elt.tagName === 'search-pattern') {
      var searchPattern = elt.textContent.trim();
      var fixedSearchPattern = removeCDataMarkups(searchPattern);

      if (current !== 'path-pattern' && current !== 'interceptor1') {
        tempErrors.push('A search pattern was found at an invalid position.');
      }

      if (findExtractionMethod(fixedSearchPattern) === 0) {
        tempErrors.push('Invalid search pattern. Unrecognized strategy.');
      }

      if (tempErrors.length === 0) {
        result.searchPattern = fixedSearchPattern;
        current = 'search-pattern';
      }
    }

    // Unrecognized tag
    else {
      tempErrors.push('An unknown tag was found: ' + elt.tagName);
      loopCount --;
    }

    // Add errors
    tempErrors.forEach( function(error) {
      result.errors.push(error);
    });

    // End of the loop
    loopCount ++;
  });

  // Validate the object
  if (!result.domain) {
    result.errors.push('A domain was expected.');
  }

  if (!result.pathPattern) {
    result.errors.push('A path-pattern was expected.');
  }

  if (!result.searchPattern) {
    result.errors.push('A search-pattern was expected.');
  }

  return result;
}


/**
 * A function that find children elements from a DOM node.
 * <p>
 * This function relies on the standard and portable 'childNodes' property.
 * </p>
 *
 * @param {object} element A DOM element.
 * @returns {array} An array of DOM elements.
 */
function getElementChildren(element) {

  var children = [];
  var childNodes = element.childNodes;
  for (var i=0; i<childNodes.length; i++) {
    var child = childNodes.item(i);
    if (child.nodeType === 1) {
      children.push(child);
    }
  }

  return children;
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
 * Finds the extraction method for a given search pattern.
 * @param {string} searchPattern The search pattern.
 * @returns {integer} The ID of an extraction method.
 */
function findExtractionMethod(searchPattern) {

  var theExtMethod = 0;
  if (!! searchPattern) {
    for (var extMethod in ExtMethods) {
      var p = ExtMethods[extMethod].pattern;
      if (searchPattern.match(p)) {
        theExtMethod = ExtMethods[extMethod].id;
        break;
      }
    }
  }

  return theExtMethod;
}


/**
 * No ID with 0 here!
 */
const ExtMethods = {
  ID:      { id: 1, pattern: /^\s*id\s*:\s*(.+)$/ig },
  CLASS:   { id: 2, pattern: /^\s*class\s*:\s*(.+)$/ig },
  XPATH:   { id: 3, pattern: /^\s*xpath\s*:\s*(.+)$/ig },
  REPLACE: { id: 4, pattern: /^\s*replace\s*:\s*\'(.+)\'\s*,\s*\'(.*)\'\s*$/ig },
  EXPREG:  { id: 5, pattern: /^\s*expreg\s*:\s*(.+)\s*$/ig },
  SELF:    { id: 6, pattern: /^\s*self\s*$/ig }
};


// Make this file usable with NodeJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.parseAndVerifyDictionary = parseAndVerifyDictionary;
}
