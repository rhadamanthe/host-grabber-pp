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

    /**
     * @param {object} link The link.
     * @returns {undefined}
     */
    function startDownloadTestFn(link) {
      expect().fail('This function should not be invoked in this test.');
    }

    // Create the queue
    var queue = newQueue(handleProcessorTestFn, startDownloadTestFn);

    // Initial check
    expect(queue.processorQueue.length).to.eql(0);

    // Submit some stuff
    var p1 = {downloadLinks: [], id: 1};
    var p2 = {downloadLinks: [], id: 2};
    var p3 = {downloadLinks: [], id: 3};

    queue.append(p1);
    queue.append(p2);
    queue.append(p3);
    expect(queue.processorQueue.length).to.eql(3);

    // Wait one second and check the content, again
    setTimeout(function() {
      expect(queue.processorQueue.length).to.eql(3);
      done();
    }, 1000);
  });


  it('should process items', function(done) {

    // Setup
    var downloadCpt = 0;

    /**
     * @param {object} processor The processor.
     * @returns {undefined}
     */
    function handleProcessorTestFn(processor) {
      processor.downloadLinks.push('');
      processor.downloadLinks.push('');
    }

    /**
     * @param {object} link The link.
     * @returns {undefined}
     */
    function startDownloadTestFn(link) {
      expect(link).to.eql('');
      downloadCpt ++;
    }

    // Create the queue
    var queue = newQueue(handleProcessorTestFn, startDownloadTestFn);

    // Initial check
    expect(queue.processorQueue.length).to.eql(0);

    // Submit some stuff
    // (for every processor, we will find 2 download links)
    var p1 = {downloadLinks: [], id: 1};
    var p2 = {downloadLinks: [], id: 2};
    var p3 = {downloadLinks: [], id: 3};

    queue.append(p1);
    queue.append(p2);
    queue.append(p3);
    expect(queue.processorQueue.length).to.eql(3);
    expect(downloadCpt).to.eql(0);

    queue.process();
    expect(queue.processorQueue.length).to.eql(2);
    expect(downloadCpt).to.eql(2);

    queue.process();
    expect(queue.processorQueue.length).to.eql(1);
    expect(queue.processorQueue[0]).to.eql(p3);
    expect(downloadCpt).to.eql(4);
    done();
  });
});
