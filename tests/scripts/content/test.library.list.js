'use strict';

describe('donwload view => list.functions', function() {

  it('should build element IDs correctly', function(done) {

    var processor = {
      id: 'test0',
      downloadLinks: ['d1', 'd2', 'd3']
    };

    expect(buildDLId(processor, 'd1')).to.eql('test0-0');
    expect(buildDLId(processor, 'd3')).to.eql('test0-2');
    expect(buildDLId(processor, 'd2')).to.eql('test0-1');
    expect(buildDLId(processor, 'd50')).to.eql('test0--1');
    done();
  });


  it('should find class names from a download link', function(done) {

    expect(findClassNameFromStatus({status: 1})).to.eql('waiting');
    expect(findClassNameFromStatus({status: 2})).to.eql('success');
    expect(findClassNameFromStatus({status: 3})).to.eql('failure');
    expect(findClassNameFromStatus({status: 4})).to.eql('');
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
});
