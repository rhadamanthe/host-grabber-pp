'use strict';

describe('background => library.utilities', function() {

  it('should fix relative links correctly', function(done) {

    expect(fixRelativeLinks('http://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://toto.fr/test.jpg');
    expect(fixRelativeLinks('https://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('https://toto.fr/test.jpg');
    expect(fixRelativeLinks('//toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('//toto.fr/test.jpg');
    expect(fixRelativeLinks('ftp://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('ftp://toto.fr/test.jpg');

    expect(fixRelativeLinks('test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/path/to/current/page/test.jpg');
    expect(fixRelativeLinks('test.jpg', 'http://origin.com')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('test.jpg', 'http://origin.com/dir/')).to.eql('http://origin.com/dir/test.jpg');
    expect(fixRelativeLinks('../../images/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/path/to/images/test.jpg');

    expect(fixRelativeLinks('/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('/test.jpg', 'http://origin.com/path/to/current/page/')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('/test.jpg', 'http://origin.com:8080/path/to/current/page')).to.eql('http://origin.com:8080/test.jpg');
    done();
  });


  it('should fix URL patterns', function(done) {

    expect(fixUrlPattern('http://origin.com/test.jpg')).to.eql('(http://origin.com/test.jpg)');
    expect(fixUrlPattern('^http://origin.com/test.jpg')).to.eql('(http://origin.com/test.jpg)');
    expect(fixUrlPattern('^http://origin.com/test.jpg$')).to.eql('(http://origin.com/test.jpg)');
    expect(fixUrlPattern('http://origin.com/test.jpg$')).to.eql('(http://origin.com/test.jpg)');
    expect(fixUrlPattern('(http://origin.com/test.jpg)')).to.eql('(http://origin.com/test.jpg)');
    expect(fixUrlPattern('http://(www.)?origin.com/test.jpg')).to.eql('(http://(www.)?origin.com/test.jpg)');
    expect(fixUrlPattern('http://origin.com/[^&lt;&gt;&amp;"]+.jpg')).to.eql('(http://origin.com/[^<>&"]+.jpg)');
    done();
  });


  it('should remove CDATA mark-ups', function(done) {

    expect(removeCDataMarkups('this is a some content')).to.eql('this is a some content');
    expect(removeCDataMarkups('<![cdata[this is a some content')).to.eql('this is a some content');
    expect(removeCDataMarkups('<![cdata[this is a some content]]>')).to.eql('this is a some content');
    expect(removeCDataMarkups('this is a some content]]>')).to.eql('this is a some content');
    done();
  });


  it('should generate a UUID', function(done) {

    expect(!! uuid()).to.be(true);
    done();
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote documents', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml').then( function(xmlDoc) {
      expect(xmlDoc.documentElement.tagName).to.eql('root');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote documents, even when forcing the MIME type', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml', true, 'text/xml').then( function(xmlDoc) {
      expect(xmlDoc.documentElement.tagName).to.eql('root');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote documents as text files', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml', false).then( function(sourceAsText) {
      expect(typeof sourceAsText).to.eql('string');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote XML documents (but still valid HTML ones)', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/invalid-xml.html').then( function(xmlDoc) {
      expect(xmlDoc.documentElement.tagName.toLowerCase()).to.eql('html');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should fail to load this remote document', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/not.found.xml').then( function(xmlDoc) {
      expect().fail('This function should not have been invoked!');

    }, function(error) {
      expect(error.status).to.eql(404);
    });
  });

});
