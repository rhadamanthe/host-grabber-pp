// Functions that can be tested independently

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

/**
 * Finds the class name from a processor.
 * @param {object} processor A processor.
 * @returns {string} A CSS class name.
 */
function findClassNameFromProcessor(processor) {

  var ok = 0, ko = 0, waiting = 0;
  processor.downloadLinks.forEach( function(dlLink) {
    if (dlLink.status === 3) {
      ko ++;
    } else if (dlLink.status === 2) {
      ok ++;
    }  else if (dlLink.status === 1) {
      waiting ++;
    }
  });

  var res = 'waiting';
  if (processor.status === 8 ) { /* ProcessorStatus.NO_LINK_FOUND */
    res = 'failure';
  } else if (processor.downloadLinks.length > 0) {
    if (processor.downloadLinks.length === ko) {
      res = 'failure';
    } else if (processor.downloadLinks.length === ok) {
      res = 'success';
    } else if (waiting === 0) {
      res = 'mixed';
    }
  }

  return res;
}
