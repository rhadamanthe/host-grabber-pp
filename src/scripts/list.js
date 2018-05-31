// Initial comments:
// this extension does not use data-binding functions.
// We push model updates directly to our view (old partial MVC).
// To achieve this, we can match any view element to a model
// part through IDs.
//
// Processors have a generated UUID.
// They hold links. Link IDs are based on
// « <processor ID>-<index of the link> » and
// suffixed when required.


/* Initial actions */

var allProcessors = new Map();
loadProcessors();


/* React to messages */


browser.runtime.onMessage.addListener(request => {

  // We have new processors
  if(request.req === 'new-processors') {
    request.obj.forEach( function(processor) {
      allProcessors.set(processor.id, processor);
    });

    displayNewProcessors( Array.from( allProcessors.values()));
    //storeProcessors();
  }

  // We need to update a processor
  else if(request.req === 'update-processor') {
    updateProcessor(request.obj);
  }
});


/* Functions */


/**
 * Stores the processors in the local storage.
 * @returns {undefined}
 */
function storeProcessors() {
/*
  browser.storage.local.set({
    processorsMap: allProcessors
  });
*/
}


/**
 * Gets the processors from the local storage.
 * @returns {object} A non-null map.
 */
function loadProcessors() {

  /*
  browser.storage.local.get('processorsMap').then( function(item) {
    console.log(item);
    allProcessors = item || new Map();
  }, function() {
    allProcessors = new Map();
  });
  */

  // TODO: local storage?

  // Eventually, retrieve the new ones
  browser.runtime.sendMessage({req: 'get-processors'});
}


/**
 * Updates a processor from the background script.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function updateProcessor(processor) {

  var p = allProcessors.get(processor.id);
  if (!! p) {

    // Update the model
    p.status = processor.status;
    p.downloadLinks = processor.downloadLinks;
    // FIXME: save?

    // Update the processor's status
    var pStatus = document.getElementById(processor.id + '-status');
    pStatus.className = findClassNameFromProcessor(processor) + ' col2';

    // Update the view
    p.downloadLinks.forEach( function(dlLink) {
      var id = buildDLId(processor, dlLink);

      // Status and download links
      var item = document.getElementById(id + '-status');
      if (!! item) {
        item.className = findClassNameFromStatus(dlLink) + ' col2';
      } else {
        displayNewLink(processor.id, dlLink, id);
      }

      // If the item was downloaded, update the link in the view
      updateDownloadLinkInView(dlLink, id);
    });
  }
}


/**
 * Displays the new processors.
 * @param {array} processors The processors.
 * @returns {undefined}
 */
function displayNewProcessors(processors) {

  processors.forEach( function(processor) {

    // Do not recreate elements that already exist
    var tBody = document.getElementById(processor.id);
    if (!! tBody) {
      return;
    }

    // Create new elements
    var items = document.getElementById('items');
    var collapsible = document.createElement('div');
    collapsible.id = processor.id;
    collapsible.className = 'wrap-collabsible';
    items.appendChild(collapsible);

    var input = document.createElement('input');
    input.id = processor.id + '-collapsible';
    input.className = 'toggle';
    input.type = 'checkbox';
    collapsible.appendChild(input);

    var label = document.createElement('label');
    label.htmlFor = processor.id + '-collapsible';
    label.className = 'lbl-toggle col1';
    label.textContent = processor.matchingUrl;
    collapsible.appendChild(label);

    var p = document.createElement('p');
    p.className = findClassNameFromProcessor(processor) + ' col2';
    p.id = processor.id + '-status';
    collapsible.appendChild(p);

    var subC1 = document.createElement('div');
    subC1.className = 'collapsible-content';
    collapsible.appendChild(subC1);

    var subC2 = document.createElement('div');
    subC2.className = 'content-inner';
    subC2.id = processor.id + '-inner';
    subC1.appendChild(subC2);

    processor.downloadLinks.forEach( function(dlLink) {
      var id = buildDLId(processor, dlLink);
      displayNewLink(processor.id, dlLink, id);
    });
  });
}


/**
 * Displays a new link.
 * @param {string} processorId The processor ID.
 * @param {object} dlLink The download link object.
 * @param {string} id The base ID for this link.
 * @returns {undefined}
 */
function displayNewLink(processorId, dlLink, id) {

  // Update the DOM
  var innerContentDiv = document.getElementById(processorId + '-inner');
  var p = document.createElement('p');
  p.className = 'dlLink col1';
  p.id = id + '-link';
  p.textContent = dlLink.link;
  innerContentDiv.appendChild(p);

  p = document.createElement('p');
  p.className = findClassNameFromStatus(dlLink) + ' col2';
  p.id = id + '-status';
  innerContentDiv.appendChild(p);

  // Update the view with download information
  updateDownloadLinkInView(dlLink, id);

  // Scroll down if necessary
  window.scrollTo(0, document.body.scrollHeight);
}


/**
 * Updates a download link in the view.
 * @param {object} dlLink The download link object.
 * @param {string} id The base ID for the link.
 * @returns {undefined}
 */
function updateDownloadLinkInView(dlLink, id) {

  if (!! dlLink.downloadItemId) {

    // Allow to open the files from the view
    var cb = function() {
      openDownloadedItem(dlLink);
    };

    // Get the icon and update the view
    browser.downloads.getFileIcon(dlLink.downloadItemId).then(function(iconUrl) {
      var item = document.getElementById(id + '-link');
      if (!! item) {
        var img = document.createElement('img');
        img.src = iconUrl;
        item.insertBefore(img, item.childNodes[0]);

        item.addEventListener('click', cb);
        item = document.getElementById(id + '-status');
        item.addEventListener('click', cb);
      }

    }, function() {
      console.log('Failed to retrieve the file icon for ' + dlLink.link);
    });
  }
}


/**
 * Opens a downloaded item.
 * @param {object} dlLink The download link object.
 * @returns {undefined}
 */
function openDownloadedItem(dlLink) {
  if (!! dlLink.downloadItemId) {
    browser.downloads.open(dlLink.downloadItemId);
  }
}
