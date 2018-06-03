
/**
 * Creates a new download manager.
 * @param {object} queue The queue (so that we can process another item).
 * @returns {object} A new download manager.
 */
function newDlManager(queue) {

  var dlManager = {
    currentDownloadIds: [],
    waitingDownloads: [],
    ongoingDownloadsCpt: 0,
    maxDownloadLimit: -1,
    onDonwloadComplete: onDonwloadComplete,
    startDownload: startDownload
  };


  // Get the right value from the preferences
  browser.storage.local.get('dlMaxParallel').then((res) => {
    dlManager.maxDownloadLimit = res.dlMaxParallel || defaultDlMaxParallel;
  });

  // Listen to changes for this preference
  browser.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.hasOwnProperty( 'dlMaxParallel' )) {
      dlManager.maxDownloadLimit = changes.dlMaxParallel.newValue;
    }
  });

  // Register a listener on downloads
  browser.downloads.onChanged.addListener(dlManager.onDonwloadComplete);


  /**
   * Reacts to the completion of a download item.
   * <p>
   * Notice this method does not update the status of the objects.
   * For the moment, the status of a download item is only about whether
   * it started correctly.
   * </p>
   *
   * @param {object} downloadDelta An object with information about the completed download.
   * @returns {undefined}
   * FIXME: should we update the status of an object here?
   */
  function onDonwloadComplete(downloadDelta) {

    if (removeFromArray(dlManager.currentDownloadIds, downloadDelta.id)) {
      // One download done
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

    // Account the download as accepted - although not yet started.
    // We do not want Firefox to start too many downloads at once.
    dlManager.ongoingDownloadsCpt ++;

    // Start the download
    var options = {
      conflictAction: 'uniquify',
      url: linkObject.link,
      saveAs: false
    };

    var downloading = browser.downloads.download(options).then( function(downloadItemId) {
      // Register the download
      dlManager.currentDownloadIds.push(downloadItemId);

      // Update the status
      linkObject.status = DlStatus.SUCCESS;
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
