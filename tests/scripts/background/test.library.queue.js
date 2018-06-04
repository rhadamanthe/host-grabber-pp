'use strict';

describe('background => library.queue', function() {
  var callbackInvoked = false;

  /**
   * A mock function.
   * @param {object} processor A processor.
   * @returns {undefined}
   */
  function handleProcessorTestFn(processor) {
    callbackInvoked = true;
  }


  it('should store elements correctly', function(done) {
    callbackInvoked = false;

    // Create the queue
    var queue = newQueue(handleProcessorTestFn);

    // Initial check
    expect(queue.processingQueue.length).to.eql(0);

    // Submit some stuff
    queue.append({downloadLinks: [], id: 1});
    queue.append({downloadLinks: [], id: 2});
    queue.append({downloadLinks: [], id: 3});
    expect(queue.processingQueue.length).to.eql(3);
    expect(callbackInvoked).to.eql(false);

    // Wait one second and check the content, again
    setTimeout(function() {
      expect(queue.processingQueue.length).to.eql(3);
      done();
    }, 1000);

    expect(callbackInvoked).to.eql(false);
  });


  it('should process items', function(done) {
    callbackInvoked = false;

    // Create the queue
    var queue = newQueue(handleProcessorTestFn);

    // Initial check
    expect(queue.processingQueue.length).to.eql(0);

    // Process an empty queue works
    queue.processNextItem();
    expect(queue.processingQueue.length).to.eql(0);
    expect(callbackInvoked).to.eql(false);

    // Submit some stuff
    queue.append({downloadLinks: [], id: 1});
    queue.append({downloadLinks: [], id: 2});

    var p3 = {downloadLinks: [], id: 3};
    queue.append(p3);

    expect(queue.processingQueue.length).to.eql(3);
    expect(queue.processingHistory.size).to.eql(3);

    queue.processNextItem();
    expect(queue.processingQueue.length).to.eql(2);
    expect(callbackInvoked).to.eql(true);

    queue.processNextItem();
    expect(queue.processingQueue.length).to.eql(1);
    expect(queue.processingHistory.size).to.eql(3);
    expect(queue.processingQueue[0]).to.eql(p3);
    done();
  });


  it('should remove items from the history', function(done) {

    var queue = newQueue(handleProcessorTestFn);
    queue.append({downloadLinks: [], id: 1});
    queue.append({downloadLinks: [], id: 2});
    queue.append({downloadLinks: [], id: 3});
    expect(queue.processingQueue.length).to.eql(3);
    expect(queue.processingHistory.size).to.eql(3);

    queue.remove(2);
    expect(queue.processingQueue.length).to.eql(2);
    expect(queue.processingHistory.size).to.eql(2);

    queue.remove(4);
    expect(queue.processingQueue.length).to.eql(2);
    expect(queue.processingHistory.size).to.eql(2);

    queue.remove(1);
    queue.remove(3);
    expect(queue.processingQueue.length).to.eql(0);
    expect(queue.processingHistory.size).to.eql(0);
    done();
  });


  it('should reschedule an item to process', function(done) {

    var processed = 0;
    var processor = {downloadLinks: [], id: 1};
    var queue = newQueue(handleProcessorTestFn);
    queue.processNextItem = function() {
      processed ++;
    };

    queue.reschedule(processor.id);
    expect(queue.processingQueue.length).to.eql(0);
    expect(queue.processingHistory.size).to.eql(0);
    expect(processed).to.eql(0);

    queue.append(processor);
    expect(queue.processingQueue.length).to.eql(1);
    expect(queue.processingHistory.size).to.eql(1);
    expect(processed).to.eql(0);

    queue.processingQueue = [];
    expect(queue.processingQueue.length).to.eql(0);
    expect(queue.processingHistory.size).to.eql(1);
    expect(processed).to.eql(0);

    queue.reschedule(processor.id);
    expect(queue.processingQueue.length).to.eql(1);
    expect(queue.processingHistory.size).to.eql(1);
    expect(processed).to.eql(1);

    queue.remove(processor.id);
    expect(queue.processingQueue.length).to.eql(0);
    expect(queue.processingHistory.size).to.eql(0);
    expect(processed).to.eql(1);
    done();
  });
});
