'use strict';

describe('donwload view => list.functions', function() {

  it('should find class names from a download link', function(done) {

    expect(findClassNameFromStatus({status: DlStatus.WAITING})).to.eql('waiting');
    expect(findClassNameFromStatus({status: DlStatus.SUCCESS})).to.eql('success');
    expect(findClassNameFromStatus({status: DlStatus.FAILURE})).to.eql('failure');
    expect(findClassNameFromStatus({status: DlStatus.DOWNLOADING})).to.eql('downloading');
    expect(findClassNameFromStatus({status: DlStatus.INVALID_MIME_TYPE})).to.eql('invalid-mime-type');
    expect(findClassNameFromStatus({status: DlStatus.UNEXPECTED_SMALL_SIZE})).to.eql('unexpected-small-size');
    expect(findClassNameFromStatus({status: DlStatus.ALREADY_DOWNLOADED})).to.eql('already-downloaded');
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
      downloadLinks: [{status: DlStatus.FAILURE}, {status: DlStatus.FAILURE}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('failure');
    done();
  });


  it('should find class names from a processor (all succeeded)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: DlStatus.SUCCESS}, {status: DlStatus.SUCCESS}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('success');
    done();
  });


  it('should find class names from a processor (some are still waiting)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: DlStatus.SUCCESS}, {status: 1}, {status: DlStatus.FAILURE}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('waiting');
    done();
  });


  it('should find class names from a processor (some success and some failures)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: DlStatus.SUCCESS}, {status: DlStatus.FAILURE}, {status: DlStatus.SUCCESS}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('mixed');
    done();
  });


  it('should find class names from a processor (some success and some invalid MIME type)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: DlStatus.SUCCESS}, {status: DlStatus.INVALID_MIME_TYPE}, {status: DlStatus.SUCCESS}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('mixed');
    done();
  });


  it('should find class names from a processor (some success and some already downloaded)', function(done) {
    var processor = {
      status: 0,
      downloadLinks: [{status: DlStatus.SUCCESS}, {status: DlStatus.ALREADY_DOWNLOADED}, {status: DlStatus.SUCCESS}]
    };

    expect(findClassNameFromProcessor(processor)).to.eql('success');
    done();
  });
});
