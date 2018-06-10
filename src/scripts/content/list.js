// This extension does not use data-binding frameworks.
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

var removeCompletedDlAutomatically = false;
browser.storage.local.get('dlClearCompleted').then((res) => {
  removeCompletedDlAutomatically = res.dlClearCompleted || defaultDlClearCompleted;
});


/* Callbacks */


document.getElementById('options').onclick = showOptionsPage;
document.getElementById('remove-completed').onclick = removeCompleted;
document.getElementById('remove-selection').onclick = removeSelection;
document.getElementById('retry-downloads').onclick = retryDownloads;

browser.storage.onChanged.addListener(function(changes, area) {
  if (area !== 'local') {
    return;
  }

  if (changes.hasOwnProperty( 'dlClearCompleted' )) {
    removeCompletedDlAutomatically = changes.dlClearCompleted.newValue;
    if (removeCompletedDlAutomatically) {
      removeCompleted();
    }
  }
});


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

    // Do not overwrite the download links, update them
    var index = new Map();
    p.downloadLinks.forEach( function(oldDlLink) {
      index.set(oldDlLink.id, oldDlLink);
    });

    processor.downloadLinks.forEach( function(newDlLink) {
      if (index.has(newDlLink.id)) {
        var oldDlLink = index.get(newDlLink.id);
        oldDlLink.status = newDlLink.status;
        oldDlLink.downloadItemId = newDlLink.downloadItemId;
      } else {
        p.downloadLinks.push(newDlLink);
      }
    });

    // FIXME: save?

    // Update the processor's status
    var pStatus = document.getElementById(processor.id + '-status');
    var class_ = findClassNameFromProcessor(processor);
    pStatus.className = class_ + ' col2';
    pStatus.textContent = findAndVerifyValue(class_);

    // Update the view
    p.downloadLinks.forEach( function(dlLink) {

      // Status and download links
      var item = document.getElementById(dlLink.id + '-link');
      if (!! item) {
        item = document.getElementById(dlLink.id + '-status');
        var class_ = findClassNameFromStatus(dlLink);
        item.className = class_ + ' col2';
        item.textContent = findAndVerifyValue(class_);
      } else {
        displayNewLink(processor.id, dlLink);
      }

      // If the item was downloaded, update the link in the view
      updateDownloadLinkInView(dlLink);
    });

    // Do we need to remove completed downloads automatically?
    // If so, let people see their item reach the green color.
    if (removeCompletedDlAutomatically) {
      setTimeout(function() {
        removeProcessor(processor.id);
      }, 1000);
    }
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

    var class_ = findClassNameFromProcessor(processor);
    var p = document.createElement('p');
    p.className = class_ + ' col2';
    p.id = processor.id + '-status';
    p.textContent = '[ ' + findAndVerifyValue(class_) + ' ]';
    collapsible.appendChild(p);

    p = document.createElement('p');
    p.className = 'col3 col33';
    p.onclick = switchCheckedValueForCol3;
    collapsible.appendChild(p);

    input = document.createElement('input');
    input.type = 'checkbox';
    input.id = processor.id;
    p.appendChild(input);

    label = document.createElement('label');
    label.htmlFor = processor.id;
    p.appendChild(label);

    var subC1 = document.createElement('div');
    subC1.className = 'collapsible-content';
    collapsible.appendChild(subC1);

    var subC2 = document.createElement('div');
    subC2.className = 'content-inner';
    subC2.id = processor.id + '-inner';
    subC1.appendChild(subC2);

    processor.downloadLinks.forEach( function(dlLink) {
      displayNewLink(processor.id, dlLink);
    });
  });
}


/**
 * Displays a new link.
 * @param {string} processorId The processor ID.
 * @param {object} dlLink The download link object.
 * @returns {undefined}
 */
function displayNewLink(processorId, dlLink) {

  // Update the DOM
  var innerContentDiv = document.getElementById(processorId + '-inner');
  var p = document.createElement('p');
  p.className = 'dlLink col11';
  p.id = dlLink.id + '-link';
  p.textContent = dlLink.link;
  innerContentDiv.appendChild(p);

  p.addEventListener('click', function() {
    openDownloadItem(dlLink);
  });

  var class_ = findClassNameFromStatus(dlLink);
  p = document.createElement('p');
  p.className = class_ + ' col2';
  p.id = dlLink.id + '-status';
  p.textContent = '[ ' + findAndVerifyValue( class_ ) + ' ]';
  innerContentDiv.appendChild(p);

  // Update the view with download information
  updateDownloadLinkInView(dlLink);
}


/**
 * Updates a download link in the view.
 * @param {object} dlLink The download link object.
 * @returns {undefined}
 */
function updateDownloadLinkInView(dlLink) {

  // Get the icon and update the view
  if (!! dlLink.downloadItemId) {
    browser.downloads.getFileIcon(dlLink.downloadItemId).then(function(iconUrl) {
      var item = document.getElementById(dlLink.id + '-link');
      if (!! item) {
        var img = document.createElement('img');
        img.src = iconUrl;
        item.insertBefore(img, item.childNodes[0]);
      }

    }, function() {
      console.log('Failed to retrieve the file icon for ' + dlLink.link);
    });
  }
}


/**
 * Opens a download item.
 * @param {object} dlLink The download link object.
 * @returns {undefined}
 */
function openDownloadItem(dlLink) {

  // The file was downloaded, open it.
  // Otherwise, open the link in the browser.
  if (!! dlLink.downloadItemId) {
    browser.downloads.open(dlLink.downloadItemId).then(function() {
      // nothing
    }, function() {
      openTab(dlLink.link);
    });
  }

  // If the link is visible, allow to open it in the browser.
  else {
    openTab(dlLink.link);
  }
}


/**
 * Removes a processor from both the view and the model.
 * @param {object} processorId A processor ID.
 * @returns {undefined}
 */
function removeProcessor(processorId) {

  // Remove from the view
  var item = document.getElementById(processorId);
  if (!! item) {
    var toDelete = item.parentNode.parentNode;
    toDelete.parentNode.removeChild(toDelete);
  }

  // Remove from the model
  allProcessors.delete(processorId);
  browser.runtime.sendMessage({req: 'remove-processor', obj: processorId});
}


/**
 * Removes all the processors whose downloads have successfully completed.
 * @returns {undefined}
 */
function removeCompleted() {

  allProcessors.forEach( function(processor, processorId) {
    if (findClassNameFromProcessor(processor) === 'success') {
      removeProcessor(processor.id);
    }
  });
}


/**
 * Removes the selected processors.
 * @returns {undefined}
 */
function removeSelection() {

  document.querySelectorAll('.col3 > input:checked').forEach( function(item) {
    removeProcessor(item.id);
  });
}


/**
 * Tries to download items that failed.
 * @returns {undefined}
 */
function retryDownloads() {

  document.querySelectorAll('.col3 > input:checked').forEach( function(item) {
    var processorId = item.id;

    // Remove download items from the view
    var innerContentDiv = document.getElementById(processorId + '-inner');
    if (!! innerContentDiv) {
      while (innerContentDiv.hasChildNodes()) {
        innerContentDiv.removeChild(innerContentDiv.lastChild);
      }
    }

    // Reset the state of the processor
    var statusItem = document.getElementById(processorId + '-status');
    if (!! statusItem) {
      statusItem.className = 'waiting col2';
    }

    // Notify the background it should process this item once again
    browser.runtime.sendMessage({req: 'restart-download', obj: processorId});
    item.checked = false;
  });
}


/**
 * Input boxes in col3 elements should be updated when their parent is clicked.
 * @returns {undefined}
 */
function switchCheckedValueForCol3() {
  this.firstChild.checked = ! this.firstChild.checked;
}
