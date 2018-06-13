
/**
 * Parses and verifies the dictionary.
 * @param {object} dictionaryDocument A DOM document.
 * @returns {object} An object with items and errors.
 */
function parseAndVerifyDictionary(dictionaryDocument) {

  var result = {};
  result.errors = [];
  result.items = [];

  var foundIds = [];
  for (var i = 0; i<dictionaryDocument.documentElement.children.length; i++) {
    var elt = dictionaryDocument.documentElement.children[i];
    if (elt.tagName !== 'host') {
      result.errors.push('An unknown tag was found in the dictionary: ' + elt.tagName);
      continue;
    }

    if (!elt.getAttribute('id')) {
      result.errors.push('A host without an ID was found.');
      continue;
    }

    var id = elt.getAttribute('id');
    if (foundIds.indexOf(id) !== -1) {
      result.errors.push('A same ID is used by several hosts in the dictionary: ' + id);
      continue;
    }

    foundIds.push(id);
    var obj = parseAndVerifyDictionaryItem(elt);
    result.items.push(obj);
    obj.errors.forEach( function(error) {
      result.errors.push('[' + obj.id + '] ' + error);
    });
  }

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
  for (var i = 0; i<domElement.children.length; i++) {
    var elt = domElement.children[i];
    var tempErrors = [];

    // Domain
    if (elt.tagName === 'domain') {
      var domain = elt.innerHTML.trim();
      if (loopCount !== 0) {
        tempErrors.push('A domain was found at an invalid position.');
      }

      if (!domain.match(domainPattern)) {
        tempErrors.push('Invalid domain: ' + domain);
      }

      if (tempErrors.length === 0) {
        result.domain = domain;
        current = 'domain';
      }
    }

    // Interceptor
    else if (elt.tagName === 'interceptor') {
      var interceptor = elt.innerHTML.trim();
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
      var pathPattern = elt.innerHTML.trim();
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
      var searchPattern = elt.innerHTML.trim();
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
  }

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
