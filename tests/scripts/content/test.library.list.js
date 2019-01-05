'use strict';

describe('donwload view => list.functions', function() {

  it('should find class names from a download link', function(done) {

    expect(findClassNameFromStatus({status: 1})).to.eql('waiting');
    expect(findClassNameFromStatus({status: 2})).to.eql('success');
    expect(findClassNameFromStatus({status: 3})).to.eql('failure');
    expect(findClassNameFromStatus({status: 4})).to.eql('downloading');
    expect(findClassNameFromStatus({status: 5})).to.eql('invalid-mime-type');
    expect(findClassNameFromStatus({status: 6})).to.eql('unexpected-small-size');
    expect(findClassNameFromStatus({status: 5748})).to.eql('');
    done();
  });


  it('should find class names from a processor (no DL yet)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: []
    };

    expect(findClassNameFromProcessor(processor)).to.eql('waiting');
    done();
  });


  it('should find class names from a processor (no DL at all)', function(done) {
    var processor = {
      status: 8,
      downloadLinks: []
    };

    expect(findClassNameFromProcessor(processor)).to.eql('failure');
    done();
  });


  it('should find class names from a processor (all failed)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: 3}, {status: 3}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('failure');
    done();
  });


  it('should find class names from a processor (all succeeded)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: 2}, {status: 2}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('success');
    done();
  });


  it('should find class names from a processor (some are still waiting)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: 2}, {status: 1}, {status: 3}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('waiting');
    done();
  });


  it('should find class names from a processor (some success and some failures)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: 2}, {status: 3}, {status: 2}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('mixed');
    done();
  });


  it('should find class names from a processor (some success and some invalid MIME type)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: 2}, {status: 5}, {status: 2}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('mixed');
    done();
  });
});
