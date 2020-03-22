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

// If one button is visible, they all are.
// They do not exist in the simulation page.
if ((!! document.getElementById('options'))) {
  document.getElementById('options').onclick = showOptionsPage;
  document.getElementById('remove-completed').onclick = removeCompleted;
  document.getElementById('remove-selection').onclick = removeSelection;
  document.getElementById('remove-all').onclick = removeAll;
  document.getElementById('select-all').onclick = selectAll;
  document.getElementById('unselect-all').onclick = unselectAll;
  document.getElementById('retry-selected').onclick = retrySelected;
  document.getElementById('retry-all').onclick = retryAll;
}

document.querySelectorAll('.dropdown > button').forEach( function(item) {
  item.onclick = showSubMenu;
});

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
    if (!! request.options) {
      if (request.options.clear) {
        removeAll();
      }

      if (!! request.options.pageUrl) {
        var anchor = document.querySelector('#title-link');
        anchor.textContent = request.options.pageUrl;
        anchor.href = request.options.pageUrl;
      }
    }

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
 * Gets the processors from the background script.
 * @returns {object} A non-null map.
 */
function loadProcessors() {

  // Hack from the death: we check the page's title
  // to determine what processors we want: the real ones,
  // or those for simulation.
  if (document.title.toUpperCase().includes('SIMULATION')) {
    browser.runtime.sendMessage({req: 'get-simulation-processors'});
  } else {
    browser.runtime.sendMessage({req: 'get-processors'});
  }
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

    // Add the new ones if necessary
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
    if (class_ === 'success' && removeCompletedDlAutomatically) {
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

    // Create the processor
    var items = document.getElementById('items');
    var collapsible = document.createElement('div');
    collapsible.className = 'wrap-collabsible';
    items.appendChild(collapsible);

    var toggleInput = document.createElement('input');
    toggleInput.id = processor.id + '-collapsible';
    toggleInput.className = 'toggle';
    toggleInput.type = 'checkbox';
    collapsible.appendChild(toggleInput);

    var label = document.createElement('label');
    label.htmlFor = processor.id + '-collapsible';
    label.className = 'lbl-toggle col1';
    collapsible.appendChild(label);

    var link = document.createElement('a');
    link.textContent = processor.matchingUrl;
    link.href = processor.matchingUrl;
    label.appendChild(link);
    link.addEventListener('click', function(event) {
      event.preventDefault();
      toggleInput.checked = ! toggleInput.checked;
    });

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

    var input = document.createElement('input');
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

    // Add a link to the source document
    p = document.createElement('p');
    p.className = 'debugLink col11';
    subC2.appendChild(p);

    link = document.createElement('a');
    link.textContent = 'Source code of the target page';
    link.href = 'view-source:' + processor.matchingUrl;
    link.setAttribute('target', '_blank');
    p.appendChild(link);

    // Add links
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
  innerContentDiv.appendChild(p);

  var link = document.createElement('a');
  link.textContent = dlLink.link;
  link.href = dlLink.link;
  p.appendChild(link);
  link.addEventListener('click', function(event) {
    event.preventDefault();
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
      if (!! item && item.getElementsByTagName('img').length === 0) {
        var img = document.createElement('img');
        img.src = iconUrl;
        item.insertBefore(img, item.childNodes[0]);
      }

    }, function() {
      // console.log('Failed to retrieve the file icon for ' + dlLink.link);
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
 * Removes all the processors.
 * @returns {undefined}
 */
function removeAll() {

  allProcessors.forEach( function(processor, processorId) {
    removeProcessor(processor.id);
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
 * Selects all the processors.
 * @returns {undefined}
 */
function selectAll() {

  document.querySelectorAll('.col3 > input').forEach( function(item) {
    item.checked = true;
  });
}


/**
 * Selects all the processors.
 * @returns {undefined}
 */
function unselectAll() {

  document.querySelectorAll('.col3 > input').forEach( function(item) {
    item.checked = false;
  });
}


/**
 * Restarts the download of all the selected items.
 * @returns {undefined}
 */
function retrySelected() {
  retryDownloads(true);
}


/**
 * Restarts all the downloads.
 * @returns {undefined}
 */
function retryAll() {
  retryDownloads(false);
}


/**
 * Restarts downloads.
 * @param {boolean} selectedOnly True to only consider selected items.
 * @returns {undefined}
 */
function retryDownloads(selectedOnly) {

  var q = !! selectedOnly ? 'input:checked' : 'input';
  document.querySelectorAll('.col3 > ' + q).forEach( function(item) {
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
    var processor = allProcessors.get(processorId)
    browser.runtime.sendMessage({req: 'restart-download', obj: processor});
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


/**
 * Handles the display / hiding of sub-menus.
 * @returns {undefined}
 */
function showSubMenu() {
  this.classList.toggle('button-selected');

  var contents = this.parentNode.getElementsByClassName('dropdown-content');
  if (contents.length > 0) {
    contents[0].classList.toggle('dropdown-content-show');
  }
}
