'use strict';

describe('background => library.queue', function() {


  it('should store and pick up elements correctly', function(done) {

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

    // Wait one second and check the content
    setTimeout(function() {

      expect(queue.processorQueue.length).to.eql(0);
      expect(pickedUpProcessors.length).to.eql(3);
      expect(pickedUpProcessors).to.eql([p1, p2, p3]);
      done();

    }, 1000);
  });


  it('should send links for download', function(done) {

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
    var p1 = {downloadLinks: [], id: 1};
    var p2 = {downloadLinks: [], id: 2};
    var p3 = {downloadLinks: [], id: 3};

    queue.append(p1);
    queue.append(p2);
    queue.append(p3);

    // Wait one second and check the content
    setTimeout(function() {

      expect(queue.processorQueue.length).to.eql(0);
      expect(downloadCpt).to.eql(6);
      done();

    }, 1000);
  });
});
