
/**
 * Creates a new download manager.
 * @param {object} queue The queue (so that we can process another item).
 * @returns {object} A new download manager.
 */
function newDlManager(queue) {

  var dlManager = {
    waitingDownloads: [],
    ongoingDownloadsCpt: 0,
    maxDownloadLimit: -1,
    hideSuccessfulDownloadItems: true,
    onDonwloadComplete: onDonwloadComplete,
    startDownload: startDownload,
    downloadIdToLinkObject: new Map()
  };


  // Get the right value from the preferences
  browser.storage.local.get(['dlMaxParallel', 'hideSuccessfulDownloadItems']).then((res) => {
    dlManager.maxDownloadLimit = res.dlMaxParallel || defaultDlMaxParallel;
    dlManager.hideSuccessfulDownloadItems = res.hideSuccessfulDownloadItems || defaultHideSuccessfulDownloadItems;
  });

  // Listen to changes for this preference
  browser.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local') {
      if (changes.hasOwnProperty( 'dlMaxParallel' )) {
        dlManager.maxDownloadLimit = changes.dlMaxParallel.newValue;
      } else if (changes.hasOwnProperty( 'hideSuccessfulDownloadItems' )) {
        dlManager.hideSuccessfulDownloadItems = changes.hideSuccessfulDownloadItems.newValue;
      }
    }
  });

  // Register a listener on downloads
  browser.downloads.onChanged.addListener(dlManager.onDonwloadComplete);


  /**
   * Reacts to the completion of a download item.
   * @param {object} downloadDelta An object with information about the completed download.
   * @returns {undefined}
   */
  function onDonwloadComplete(downloadDelta) {

    // Verify whether it is a download we started
    var linkObject = dlManager.downloadIdToLinkObject.get(downloadDelta.id);
    if (! linkObject) {
      return;
    }

    // In Chrome, there is no state when a download starts
    if (! downloadDelta.state) {
      return;
    }

    // So, this is a download we started
    if (downloadDelta.state.current === 'complete') {
      linkObject.status = DlStatus.SUCCESS;
      updateProcessorInDownloadView(linkObject.processor);

      if (dlManager.hideSuccessfulDownloadItems) {
        browser.downloads.erase({id: downloadDelta.id});
      }

    } else if (downloadDelta.state.current === 'interrupted') {
      linkObject.status = DlStatus.FAILURE;
      updateProcessorInDownloadView(linkObject.processor);
    }

    // Process a new item?
    if (dlManager.downloadIdToLinkObject.delete(downloadDelta.id)) {
       // One download stopped
      dlManager.ongoingDownloadsCpt --;

      // Process the next one, if there is one
      startNextWaitingDownload();
    }
  }


  /**
   * Starts the next waiting download.
   * @returns {undefined}
   */
  function startNextWaitingDownload() {

    // Download the next file, if any
    var obj = dlManager.waitingDownloads.shift();
    if(!! obj) {
      startDownload(obj.link, obj.processor);
    }

    // Independently of the downloads, process the next item to explore
    queue.processNextItem();
  }


  /**
   * Handles the request to perform a real download.
   * <p>
   * If there is no maximum number of downloads, start downloading immediately.
   * If there is a limit and that the extension did not started as many downloads,
   * then start downloading immediately. Otherwise, the download request should be
   * queued and started once the previous ones completed.
   * </p>
   * <p>
   * When a real download is started, this function updates the link object's status.
   * </p>
   *
   * @param {object} linkObject An object that holds a download link and status.
   * @param {object} processor The processor that holds the link object.
   * @returns {undefined}
   */
  function startDownload(linkObject, processor) {

    // Can we start the download right now?
    // Or should we make it wait?
    if (dlManager.maxDownloadLimit > 0 &&
        dlManager.ongoingDownloadsCpt >= dlManager.maxDownloadLimit) {

      dlManager.waitingDownloads.push({
        link: linkObject,
        processor: processor
      });
      return;
    }

    // Update the structure of a download link locally
    linkObject.processor = processor;

    // Account the download as accepted - although not yet started.
    // We do not want Firefox to start too many downloads at once.
    dlManager.ongoingDownloadsCpt ++;

    // Start the download
    var options = {
      conflictAction: 'uniquify',
      url: linkObject.link,
      saveAs: false
    };

    // Bug in Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=417112

    var downloading = browser.downloads.download(options).then( function(downloadItemId) {
      // Register the download
      dlManager.downloadIdToLinkObject.set(downloadItemId, linkObject);

      // Update the status
      linkObject.status = DlStatus.DOWNLOADING;
      linkObject.downloadItemId = downloadItemId;
      updateProcessorInDownloadView(processor);

      // Process the next item
      queue.processNextItem();

    }, function(error) {
      // The download could not be started, try another one
      dlManager.ongoingDownloadsCpt --;
      startNextWaitingDownload();

      // Update the status
      linkObject.status = DlStatus.FAILURE;
      updateProcessorInDownloadView(processor);

      // Process the next item
      queue.processNextItem();
    });
  }

  return dlManager;
}
