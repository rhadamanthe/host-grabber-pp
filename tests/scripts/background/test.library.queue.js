'use strict';

describe('background => library.queue', function() {

  it('should store elements correctly', function(done) {

    // Setup
    var pickedUpProcessors = [];

    /**
     * @param {object} processor The processor.
     * @returns {undefined}
     */
    function handleProcessorTestFn(processor) {
      pickedUpProcessors.push(processor);
    }

    // Create the queue
    var queue = newQueue(handleProcessorTestFn);

    // Initial check
    expect(queue.processingQueue.length).to.eql(0);

    // Submit some stuff
    var p1 = {downloadLinks: [], id: 1};
    var p2 = {downloadLinks: [], id: 2};
    var p3 = {downloadLinks: [], id: 3};

    queue.append(p1);
    queue.append(p2);
    queue.append(p3);
    expect(queue.processingQueue.length).to.eql(3);

    // Wait one second and check the content, again
    setTimeout(function() {
      expect(queue.processingQueue.length).to.eql(3);
      done();
    }, 1000);
  });


  it('should process items', function(done) {

    /**
     * @param {object} processor The processor.
     * @returns {undefined}
     */
    function handleProcessorTestFn(processor) {
      processor.downloadLinks.push('');
      processor.downloadLinks.push('');
    }

    // Create the queue
    var queue = newQueue(handleProcessorTestFn);

    // Initial check
    expect(queue.processingQueue.length).to.eql(0);

    // Process an empty queue works
    queue.processNextItem();
    expect(queue.processingQueue.length).to.eql(0);

    // Submit some stuff
    var p1 = {downloadLinks: [], id: 1};
    var p2 = {downloadLinks: [], id: 2};
    var p3 = {downloadLinks: [], id: 3};

    queue.append(p1);
    queue.append(p2);
    queue.append(p3);
    expect(queue.processingQueue.length).to.eql(3);
    expect(queue.processingHistory.length).to.eql(3);

    queue.processNextItem();
    expect(queue.processingQueue.length).to.eql(2);

    queue.processNextItem();
    expect(queue.processingQueue.length).to.eql(1);
    expect(queue.processingHistory.length).to.eql(3);
    expect(queue.processingQueue[0]).to.eql(p3);
    done();
  });
});
