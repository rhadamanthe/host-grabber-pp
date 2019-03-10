
var dictionaryItems = [];
browser.runtime.sendMessage({req: 'get-dictionary'});
browser.runtime.onMessage.addListener(request => {

  if (request.req === 'this-dictionary' && !! request.obj) {
    dictionaryItems = request.obj;
    dictionaryItems.sort( function(a, b) {
      return a.id.localeCompare(b.id);
    });

    loadCurrentDictionaryInSidebar();
  }
});

document.querySelector('#simulateButton').addEventListener('click', simulateAction);
document.querySelector('#simulateButton').addEventListener('click', showFeedback);
document.querySelector('#backButton').addEventListener('click', backToForm);
document.querySelector('#exportButton').addEventListener('click', showExportSection);
document.querySelector('#dictionary-items').addEventListener('change', fillInItemProperties);


// Functions

/**
 * Brings the form back.
 * @returns {undefined}
 */
function backToForm() {
  document.querySelector('#exportSection').style.display = 'none';
  document.querySelector('#formSection').style.display = 'block';
}


/**
 * Shows the export section.
 * @returns {undefined}
 */
function showExportSection() {

  // Clear the previous stuff
  var xmlCatalog = document.querySelector('#xml-catalog');
  xmlCatalog.innerHTML = '';

  // Build the dictionary item
  var s = buildDictionaryItem();
  s.split('\n').forEach( function( item, index ) {
    var firstPos = item.indexOf('>');
    var endPos = item.lastIndexOf('<');
    if (index !== 0) {
      xmlCatalog.appendChild( document.createElement('br'));
    }

    if (firstPos === item.length - 1) {
      highlight(xmlCatalog, 'xml-markup', item.substring(0));
    } else {
      highlight(xmlCatalog, 'xml-markup', '  ' + item.substring(0, firstPos + 1));
      xmlCatalog.appendChild( document.createElement('br'));
      highlight(xmlCatalog, '', '  ' + item.substring(firstPos + 1, endPos));
      xmlCatalog.appendChild( document.createElement('br'));
      highlight(xmlCatalog, 'xml-markup', '  ' + item.substring(endPos));
    }
  });

  // Update the display
  document.querySelector('#formSection').style.display = 'none';
  document.querySelector('#exportSection').style.display = 'block';
}


/**
 * Highlights an element in the XML catalog.
 * @param {object} xmlCatalog The HTML parent node.
 * @param {string} className The class name.
 * @param {string} content The content to display.
 * @returns {undefined}
 */
function highlight(xmlCatalog, className, content) {

  var markup = document.createElement('span');
  xmlCatalog.appendChild(markup);
  markup.className = className;
  markup.textContent = content;
}



/**
 * Loads the current dictionary in the side bar.
 * @returns {undefined}
 */
function loadCurrentDictionaryInSidebar() {

  // Get the dictionary from the background script
  var insertionPoint = document.querySelector('#dictionary-items');

  // Clear all the options
  while (insertionPoint.firstChild) {
    insertionPoint.removeChild(insertionPoint.firstChild);
  }

  // Add an empty option
  var option = document.createElement('option');
  option.value = '';
  option.textContent = '';
  insertionPoint.appendChild(option);

  // Insert item IDs in the page
  dictionaryItems.forEach( function(item) {
    option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.id;
    insertionPoint.appendChild(option);
  });
}


/**
 * Fills-in the form fields from a selected item.
 * @returns {undefined}
 */
function fillInItemProperties() {

  var itemsAnchor = document.querySelector('#dictionary-items');
  var selected = '';
  if (itemsAnchor.selectedIndex > -1 ) {
    selected = itemsAnchor.options[itemsAnchor.selectedIndex].value;
  }

  if (selected !== '') {
    dictionaryItems.some( function(item) {
      if (item.id === selected) {

        // Simple fields
        document.querySelector('#search-pattern').value = item.searchPattern;
        document.querySelector('#path-pattern').value = item.pathPattern;

        // The domain is special
        if (item.domain instanceof RegExp) {
          var domain = String(item.domain);
          domain = domain.substring(1, domain.length - 1);
          document.querySelector('#domain').value = domain;
          document.querySelector('#domain-is-regexp').checked = true;
        } else {
          document.querySelector('#domain').value = item.domain;
          document.querySelector('#domain-is-regexp').checked = false;
        }

        // Interceptors are arrays, but we only display one here (lazy-ness)
        if (item.interceptors1.length > 0) {
          document.querySelector('#interceptor1').value = item.interceptors1[0].string;
        } else {
          document.querySelector('#interceptor1').value = '';
        }

        if (item.interceptors2.length > 0) {
          document.querySelector('#interceptor2').value = item.interceptors2[0].string;
        } else {
          document.querySelector('#interceptor2').value = '';
        }
      }

      // The loop will stop as soon as true is returned.
      return item.id === selected;
    });
  }
}


/**
 * Shows feedback to the user when the simulate button is clicked.
 * @returns {undefined}
 */
function showFeedback() {

  document.querySelector('#simulateButton').className = 'green';
  setTimeout( function() {
    document.querySelector('#simulateButton').className = '';
  }, 2000);
}


/**
 * Finds processors and download links without downloading them.
 * @returns {undefined}
 */
function simulateAction() {

  // Extract the current item
  var dictionaryAsString = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<root id="test" version="test" spec="1.0">\n'
    + buildDictionaryItem()
    + '\n</root>';

  // Validate
  var dictionaryDocument = new DOMParser().parseFromString(dictionaryAsString,'text/xml');
  var dictionaryWrapper = parseAndVerifyDictionary(dictionaryDocument);

  // If everything is complete, send a message to the background script
  if (dictionaryWrapper.errors.length === 0) {
    document.querySelector('#errors').textContent = '';
    browser.runtime.sendMessage({req: 'simulate-download', obj: dictionaryWrapper});

  } else {
    var errorMessage = '';
    dictionaryWrapper.errors.forEach(function(error) {
      errorMessage += error + '\n';
    });

    document.querySelector('#errors').textContent = errorMessage;
  }
}


/**
 * Builds the dictionary item from the form.
 * @returns {string} The dictionary item.
 */
function buildDictionaryItem() {

  var dictionaryAsString = '<host id="report">';
  var suffix = document.querySelector('#domain-is-regexp').checked ? '-pattern' : '';
  dictionaryAsString += '\n<domain' + suffix + '>' + document.querySelector('#domain').value + '</domain' + suffix + '>';
  dictionaryAsString += '\n<path-pattern><![CDATA[' + document.querySelector('#path-pattern').value + ']]></path-pattern>';
  if (document.querySelector('#interceptor1').value.trim().length !== 0) {
    dictionaryAsString += '\n<interceptor>' + document.querySelector('#interceptor1').value + '</interceptor>';
  }

  dictionaryAsString += '\n<search-pattern><![CDATA[' + document.querySelector('#search-pattern').value + ']]></search-pattern>';
  if (document.querySelector('#interceptor2').value.trim().length !== 0) {
    dictionaryAsString += '\n<interceptor>' + document.querySelector('#interceptor2').value + '</interceptor>';
  }

  dictionaryAsString += '\n</host>';
  return dictionaryAsString;
}
