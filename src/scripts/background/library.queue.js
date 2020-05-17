'use strict';

/**
 * Creates a new processing queue.
 * @param {function} handleProcessorFn The function to handle a processor when it is picked up in the queue.
 * @returns {object} A new queue object.
 */
function newQueue(handleProcessorFn) {

  var queue = {
    processingQueue: [],
    processingHistory: new Map(),
    append: append,
    reschedule: reschedule,
    processNextItem: processNextItem,
    remove: remove,
    handleProcessorFn: handleProcessorFn,
    paused: false,
    togglePausedStatus: togglePausedStatus
  };


  /**
   * Appends a processor to the queue.
   * @param {object} processor A Processor.
   * @returns {undefined}
   */
  function append(processor) {
    queue.processingQueue.push(processor);
    queue.processingHistory.set(processor.id, processor);
  }


  /**
   * Re-adds a processor so that it processed once again.
   * @param {string} processorId A Processor ID.
   * @returns {undefined}
   */
  function reschedule(processorId) {

    var processor = queue.processingHistory.get(processorId);
    if (!! processor) {
      resetProcessor(processor);
      var index = queue.processingQueue.indexOf(processor);
      if (index === -1) {
        queue.processingQueue.push(processor);
      }

      queue.processNextItem();
    } else {
      console.log('No processor was found for this ID: ' + processorId);
    }
  }


  /**
   * Removes a processor from the processing queue and history.
   * @param {string} processorId The processor ID.
   * @returns {undefined}
   */
  function remove(processorId) {
    var processor = queue.processingHistory.get(processorId);
    queue.processingHistory.delete(processorId);

    var index = queue.processingQueue.indexOf(processor);
    if (index > -1) {
      queue.processingQueue.splice(index, 1);
    }
  }


  /**
   * Picks the first item in the queue and processes it.
   * @returns {undefined}
   */
  function processNextItem() {

    // Is it paused?
    if (!! queue.paused) {
      return;
    }

    // Get an item to process
    var processor = queue.processingQueue.shift();

    // Handle it, provided it exists
    if (!! processor) {
      queue.handleProcessorFn(processor);
    }
  }

  /**
   * Toggles the pause status of the queue.
   * <p>
   * If the queue becomes active again (i.e. NOT paused),
   * then it picks the next item in the queue. At first,
   * only 1 item will be processed, but it will increase
   * until the maximum number of parallel downloads.
   * </p>
   *
   * @returns {undefined}
   */
  function togglePausedStatus() {
    queue.paused = ! queue.paused;
    if (! queue.paused) {
      processNextItem();
    }
  }

  // Return the new queue
  return queue;
}
