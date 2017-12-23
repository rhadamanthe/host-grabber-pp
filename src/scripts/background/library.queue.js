'use strict';


/**
 * Creates a new processing queue.
 * @returns {object} A new queue object.
 */
function newQueue() {

  var queue = {
    processorQueue: [],
    errorQueue: [],
    inProgress: false,
    extractor: extractor(),
    append: append,
    process: process
  }


  /**
   * Appends a processor to the queue and starts the processing if necessary.
   * @param {object} processor A Processor.
   * @returns {undefined}
   */
  function append(processor) {

    queue.processorsQueue.push(processor);
    if (! queue.inProgress) {
      queue.inProgress = true;
      queue.process();
    }
  }


  /**
   * Picks the first item in the queue and processes it.
   * <p>
   * If there are other items to process, rescheduling is done.
   * </p>
   *
   * @returns {undefined}
   */
  queue.process = function process() {

    // Get the item to process
    var processor = queue.processorQueue.shift();

    // Handle it
    handleProcessor(processor, queue.extractor, queue);
    for (var i=0; i<processor.downloadLinks.length; i++) {
      startDownload(processor.downloadLinks[i], processor);
    }

    // New item to process?
    // To prevent blocking usage of the shared array, we use setTimeout.
    // The JS runtime will dispatch it among other invocations.
    queue.inProgress = queue.processorQueue.length > 0;
    if (queue.inProgress) {
      setTimeout(queue.process, 0);
    }
  }

  // Return the new queue
  return queue;
}
