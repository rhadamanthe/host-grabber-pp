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

    // Update the view
    p.downloadLinks.forEach( function(dlLink) {
      var id = buildDLId(processor, dlLink);

      // Status and download links
      var item = document.getElementById(id + '-status');
      if (!! item) {
        item.className = findClassNameFromStatus(dlLink);
      } else {
        displayNewLink(processor, dlLink, id);
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
    var tBody = document.createElement('tbody');
    tBody.id = processor.id;
    items.appendChild(tBody);

    var tr = document.createElement('tr');
    tBody.appendChild(tr);

    var td = document.createElement('td');
    td.colspan = 2;
    td.textContent = processor.matchingUrl;
    tr.appendChild(td);

    processor.downloadLinks.forEach( function(dlLink) {
      var id = buildDLId(processor, dlLink);
      displayNewLink(processor, dlLink, id);
    });
  });
}


/**
 * Displays a new link.
 * @param {object} processor The processor that owns the link.
 * @param {object} dlLink The download link object.
 * @param {string} id The base ID for this link.
 * @returns {undefined}
 */
function displayNewLink(processor, dlLink, id) {

  // Update the DOM
  var tBody = document.getElementById(processor.id);
  var tr = document.createElement('tr');
  tBody.appendChild(tr);

  var td = document.createElement('td');
  td.textContent = dlLink.link;
  td.className = 'dlLink';
  td.id = id + '-link';
  tr.appendChild(td);

  td = document.createElement('td');
  td.id = id + '-status';
  td.className = findClassNameFromStatus(dlLink);
  tr.appendChild(td);

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


/**
 * Builds the base ID for a download link.
 * @param {object} processor The processor that holds this link.
 * @param {object} dlLink A download link object.
 * @returns {string} A base ID.
 */
function buildDLId(processor, dlLink) {
  var index = processor.downloadLinks.indexOf(dlLink);
  return processor.id + '-' + index;
}


/**
 * Finds the class name from the status of a download link.
 * @param {object} dlLink A download link.
 * @returns {string} A CSS class name.
 */
function findClassNameFromStatus(dlLink) {

  var result = '';
  switch(dlLink.status) {
  case /*DlStatus.FAILURE*/ 3: result = 'failure'; break;
  case /*DlStatus.SUCCESS*/ 2: result = 'success'; break;
  case /*DlStatus.WAITING*/ 1: result = 'waiting'; break;
  }

  return result;
}

