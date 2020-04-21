// This file is made so that it can be executed alone.
// No dependency to any other script.

const globalDomainPattern = /^\w[-\w\.]*\w$/;
const globalCurrent = '_$CURRENT$_';

// i18n is defined in this file
const i18n = {
  dictionary_err_1: {
    fr: 'L\'élément \'dictionary\' doit avoir un attribut \'version\'.',
    en: 'The dictionary element must have a \'version\' attribute.'
  },

  dictionary_err_2: {
    fr: 'L\'élément \'dictionary\' doit avoir un attribut \'spec\'.',
    en: 'The dictionary element must have a \'spec\' attribute.'
  },

  dictionary_err_3: {
    fr: 'L\'élément \'dictionary\' doit avoir un attribut \'ID\'.',
    en: 'The dictionary element must have an \'ID\' attribute.'
  },

  dictionary_err_4: {
    fr: 'Une balise inconnue a été trouvée dans le dictionnaire : {0}',
    en: 'An unknown tag was found in the dictionary: {0}'
  },

  dictionary_err_5: {
    fr: 'Un hôte sans identifiant a été trouvé.',
    en: 'A host without an ID was found.'
  },

  dictionary_err_6: {
    fr: 'Cet identifiant est utilisé par plusieurs éléments du dictionnaire : {0}',
    en: 'A same ID is used by several hosts in the dictionary: {0}'
  },

  dictionary_err_7: {
    fr: 'Une balise \'domain\' a été trouvée à un mauvais endroit.',
    en: 'A domain was found at an invalid position.'
  },

  dictionary_err_8: {
    fr: 'Domaine invalide : {0}',
    en: 'Invalid domain: {0}'
  },

  dictionary_err_9: {
    fr: 'Une balise \'domain-pattern\' a été trouvée à un mauvais endroit.',
    en: 'A domain pattern was found at an invalid position.'
  },

  dictionary_err_10: {
    fr: 'Un interceptor a été trouvé à un mauvais endroit.',
    en: 'An interceptor was found at an invalid position.'
  },

  dictionary_err_11: {
    fr: 'Intercepteur invalide : {0}',
    en: 'Invalid interceptor: {0}'
  },

  dictionary_err_12: {
    fr: 'Une balise \'path-pattern\' a été trouvée à un mauvais endroit.',
    en: 'A path pattern was found at an invalid position.'
  },

  dictionary_err_13: {
    fr: 'Un modèle de chemin ne peut pas commencer par \'/\'.',
    en: 'A path pattern cannot start with \'/\'.'
  },

  dictionary_err_14: {
    fr: 'Un modèle de chemin ne peut pas commencer par \'^\'.',
    en: 'A path pattern cannot start with \'^\'.'
  },

  dictionary_err_15: {
    fr: 'Un modèle de chemin ne peut pas finir par \'$\'.',
    en: 'A path pattern cannot end with \'$\'.'
  },

  dictionary_err_16: {
    fr: 'Une balise \'search-pattern\' a été trouvée à un mauvais endroit.',
    en: 'A search pattern was found at an invalid position.'
  },

  dictionary_err_17: {
    fr: 'Modèle de recherche invalide, stratégie inconnue.',
    en: 'Invalid search pattern. Unrecognized strategy.'
  },

  dictionary_err_18: {
    fr: 'Une balise inconnue a été trouvée : {0}',
    en: 'An unknown tag was found: {0}'
  },

  dictionary_err_19: {
    fr: 'Une balise \'domain\' ou \'domain-pattern\' était attendue.',
    en: 'A domain or a domain pattern was expected.'
  },

  dictionary_err_20: {
    fr: 'Une balise \'path-pattern\' était attendue.',
    en: 'A path-pattern was expected.'
  },

  dictionary_err_21: {
    fr: 'Une balise \'search-pattern\' était attendue.',
    en: 'A search-pattern was expected.'
  }
};


var theLocale = 'en';
if (typeof browser !== 'undefined'
      && typeof browser.i18n  !== 'undefined') {

  browser.i18n.getAcceptLanguages().then( function(langs) {
    var index = langs[0].indexOf('_');
    if (index !== -1) {
      theLocale = langs[0].subString(0, index);
    } else {
      theLocale = langs[0];
    }
  })
}


/**
 * Resolves the translation for a given error code.
 * @param {array} params An array of parameters.
 * @returns {string} An error message.
 */
function resolveI18n(params) {

  var s = i18n[params[0]][theLocale];
  for (var i=1; i<params.length; i++) {
    s = s.replace( '{' + (i-1) + '}', params[i]);
  }

  return s;
}


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
    result.errors.push( resolveI18n(['dictionary_err_1']));
  }

  if (!dictionaryDocument.documentElement.getAttribute('spec')) {
    result.errors.push( resolveI18n(['dictionary_err_2']));
  }

  if (!dictionaryDocument.documentElement.getAttribute('id')) {
    result.errors.push( resolveI18n(['dictionary_err_3']));
  }

  // Verify hosts
  var foundIds = [];
  getElementChildren(dictionaryDocument.documentElement).forEach( function(elt) {
    if (elt.tagName !== 'host') {
      result.errors.push( resolveI18n(['dictionary_err_4', elt.tagName]));
      return;
    }

    if (!elt.getAttribute('id')) {
      result.errors.push( resolveI18n(['dictionary_err_5']));
      return;
    }

    var id = elt.getAttribute('id');
    if (foundIds.indexOf(id) !== -1) {
      result.errors.push( resolveI18n(['dictionary_err_6', id]));
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
    var tempErrorCodes = [];

    // Domain
    if (elt.tagName === 'domain') {
      var domain = elt.textContent.trim();
      if (loopCount !== 0) {
        tempErrorCodes.push(['dictionary_err_7']);
      }

      var matchRes = domain.match(globalDomainPattern);
      if (domain !== globalCurrent &&
            (! matchRes || matchRes.length === 0)) {
        tempErrorCodes.push(['dictionary_err_8', domain]);
      }

      if (tempErrorCodes.length === 0) {
        result.domain = domain;
        current = 'domain';
      }
    }

    // Domain pattern
    else if (elt.tagName === 'domain-pattern') {
      var domainP = elt.textContent.trim();
      if (loopCount !== 0) {
        tempErrorCodes.push(['dictionary_err_9']);
      }

      if (tempErrorCodes.length === 0) {
        result.domain = new RegExp(domainP);
        current = 'domain';
      }
    }

    // Interceptor
    else if (elt.tagName === 'interceptor') {
      var interceptorAsString = elt.textContent.trim();
      if (current !== 'interceptor1' && current !== 'interceptor2' && current !== 'search-pattern' && current !== 'path-pattern') {
        tempErrorCodes.push(['dictionary_err_10']);
      }

      if (!interceptorAsString.match(ExtMethods.REPLACE.pattern)) {
        tempErrorCodes.push(['dictionary_err_11', interceptorAsString]);
      }

      if (tempErrorCodes.length === 0) {
        var match = ExtMethods.REPLACE.pattern.exec(interceptorAsString);
        var interceptor = {replace: match[1].trim(), by: match[2].trim(), string: interceptorAsString};
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
        tempErrorCodes.push(['dictionary_err_12']);
      }

      if (pathPattern.startsWith('/')) {
        tempErrorCodes.push(['dictionary_err_13']);
      }

      if (pathPattern.startsWith('^')) {
        tempErrorCodes.push(['dictionary_err_14']);
      }

      if (pathPattern.endsWith('$')) {
        tempErrorCodes.push(['dictionary_err_15']);
      }

      if (tempErrorCodes.length === 0) {
        result.pathPattern = pathPattern;
        current = 'path-pattern';
      }
    }

    // Search pattern
    else if (elt.tagName === 'search-pattern') {
      var searchPattern = elt.textContent.trim();
      var fixedSearchPattern = removeCDataMarkups(searchPattern);

      if (current !== 'path-pattern' && current !== 'interceptor1') {
        tempErrorCodes.push(['dictionary_err_16']);
      }

      if (findExtractionMethod(fixedSearchPattern) === 0) {
        tempErrorCodes.push(['dictionary_err_17']);
      }

      if (tempErrorCodes.length === 0) {
        result.searchPattern = fixedSearchPattern;
        current = 'search-pattern';
      }
    }

    // Unrecognized tag
    else {
      tempErrorCodes.push(['dictionary_err_18', elt.tagName]);
      loopCount --;
    }

    // Add errors
    tempErrorCodes.forEach( function(error) {
      var msg = resolveI18n(error);
      result.errors.push(msg);
    });

    // End of the loop
    loopCount ++;
  });

  // Validate the object
  if (!result.domain) {
    result.errors.push( resolveI18n(['dictionary_err_19']));
  }

  if (!result.pathPattern) {
    result.errors.push( resolveI18n(['dictionary_err_20']));
  }

  if (!result.searchPattern) {
    result.errors.push( resolveI18n(['dictionary_err_21']));
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
  ID:        { id: 1, pattern: /^\s*id\s*:\s*(.+)$/ig },
  CLASS:     { id: 2, pattern: /^\s*class\s*:\s*(.+)$/ig },
  XPATH:     { id: 3, pattern: /^\s*xpath\s*:\s*(.+)$/ig },
  REPLACE:   { id: 4, pattern: /^\s*replace\s*:\s*\'(.+)\'\s*,\s*\'(.*)\'\s*$/ig },
  EXPREG:    { id: 5, pattern: /^\s*expreg\s*:\s*(.+)\s*$/ig },
  SELF:      { id: 6, pattern: /^\s*self\s*$/ig },
  CSS_QUERY: { id: 7, pattern: /^\s*css query\s*:\s*(.+)$/ig }
};


// Make this file usable with NodeJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.parseAndVerifyDictionary = parseAndVerifyDictionary;
}
