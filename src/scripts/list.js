
var allProcessors;
loadProcessors();

browser.runtime.onMessage.addListener(request => {

  // We have new processors
  if(request.req === 'new-processors') {
    request.obj.forEach( function(processor) {
      allProcessors.set(processor.id, processor);
    });

    displayNewProcessors(request.obj);
    storeProcessors();
  }

  // We need to update a processor
  else if(request.req === 'update-processor') {
    updateProcessor(request.obj);
  }
});


/**
 * Stores the processors in the local storage.
 * @returns {undefined}
 */
function storeProcessors() {

  browser.storage.local.set({
    processorsMap: allProcessors
  });
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
  allProcessors = new Map();
}


/**
 * Updates a processor from the background script.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function updateProcessor(processor) {

  var p = allProcessors.get(processor.id);
  if (!! p) {
    p.status = processor.status;
    p.downloadLinks = processor.downloadLinks;
    // FIXME: save?
  }
}


// I hesitated about using a data-binding library.
// For the moment, we can manage it all with few code.


/**
 * Displays the new processors.
 * @param {array} processors The processors.
 * @returns {undefined}
 */
function displayNewProcessors(processors) {

  processors.forEach( function(processor) {
    var items = document.getElementById('items');
    var p = document.createElement('p');
    p.className = 'matchingUrl';
    p.innerHTML = processor.matchingUrl;
    items.appendChild(p);
    console.log(processor.matchingUrl)

    processor.downloadLinks.forEach( function(dlLink) {
      var dlp = document.createElement('p');
      dlp.innerHTML = dlLink.link;
      dlp.className = 'dlLink';
      items.appendChild(dlp);
    });
  });
}
