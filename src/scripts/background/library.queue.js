'use strict';


/**
 * Creates a new processing queue.
 * @param {function} handleProcessorFn The function to handle a processor when it is picked up in the queue.
 * @param {function} startDownloadFn The function to start downloading some file.
 * @returns {object} A new queue object.
 */
function newQueue(handleProcessorFn, startDownloadFn) {

  var queue = {
    processorQueue: [],
    /*
    inProgress: false,
    */
    extractor: extractor(),
    append: append,
    process: process
  };


  /**
   * Appends a processor to the queue and starts the processing if necessary.
   * @param {object} processor A Processor.
   * @returns {undefined}
   */
  function append(processor) {

    queue.processorQueue.push(processor);
    /*
    if (! queue.inProgress) {
      queue.inProgress = true;
    */
    queue.process();
    /*
    }
    */
  }


  /**
   * Picks the first item in the queue and processes it.
   * <p>
   * If there are other items to process, rescheduling is done.
   * </p>
   *
   * @returns {undefined}
   */
  function process() {

    // Get the item to process
    var processor = queue.processorQueue.shift();

    // Handle it
    handleProcessorFn(processor, queue.extractor, queue);
    for (var i=0; i<processor.downloadLinks.length; i++) {
      startDownloadFn(processor.downloadLinks[i], processor);
    }

    // New item to process?
    // To prevent blocking usage of the shared array, we use setTimeout.
    // The JS runtime will dispatch it among other invocations.
    /*
    queue.inProgress = queue.processorQueue.length > 0;
    if (queue.inProgress) {
      setTimeout(queue.process, 0);
    }
    */
  }

  // Return the new queue
  return queue;
}
