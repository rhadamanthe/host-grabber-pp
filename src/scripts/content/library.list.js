// Functions that can be tested independently

/**
 * Finds the class name from the status of a download link.
 * @param {object} dlLink A download link.
 * @returns {string} A CSS class name.
 */
function findClassNameFromStatus(dlLink) {

  var result = '';
  switch(dlLink.status) {
  case DlStatus.FAILURE: result = 'failure'; break;
  case DlStatus.SUCCESS: result = 'success'; break;
  case DlStatus.WAITING: result = 'waiting'; break;
  case DlStatus.INVALID_MIME_TYPE: result = 'invalid-mime-type'; break;
  case DlStatus.UNEXPECTED_SMALL_SIZE: result = 'unexpected-small-size'; break;
  case DlStatus.DOWNLOADING: result = 'downloading'; break;
  case DlStatus.ALREADY_DOWNLOADED: result = 'already-downloaded'; break;
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
    switch(dlLink.status) {
    case DlStatus.FAILURE:  ko ++; break;
    case DlStatus.SUCCESS: result = ok ++; break;
    case DlStatus.ALREADY_DOWNLOADED: result = ok ++; break;
    case DlStatus.WAITING: result = waiting ++; break;
    default: /* We do not care about invalid, etc). */ break;
    }
  });

  var res = 'waiting';
  if (processor.status === ProcessorStatus.NO_LINK_FOUND
      || processor.status === ProcessorStatus.RETRIEVING_LINKS_FAILURE) {
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
