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
    extractor: extractor(),
    append: append,
    process: process
  };


  /**
   * Appends a processor to the queue.
   * @param {object} processor A Processor.
   * @returns {undefined}
   */
  function append(processor) {
    queue.processorQueue.push(processor);
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

    // Get an item to process
    var processor = queue.processorQueue.shift();

    // Handle it, provided it exists
    if (!! processor) {
      handleProcessorFn(processor, queue.extractor, queue);
      for (var i=0; i<processor.downloadLinks.length; i++) {
        startDownloadFn(processor.downloadLinks[i], processor);
      }
    }
  }

  // Return the new queue
  return queue;
}
