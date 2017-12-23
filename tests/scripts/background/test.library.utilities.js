'use strict';

describe('background => library.utilities', function() {

  it('should fix relative links correctly', function(done) {

    expect(fixRelativeLinks('http://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://toto.fr/test.jpg');
    expect(fixRelativeLinks('https://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('https://toto.fr/test.jpg');
    expect(fixRelativeLinks('//toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('//toto.fr/test.jpg');
    expect(fixRelativeLinks('ftp://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('ftp://toto.fr/test.jpg');

    expect(fixRelativeLinks('test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/path/to/current/page/test.jpg');
    expect(fixRelativeLinks('test.jpg', 'http://origin.com')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('../../images/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/path/to/images/test.jpg');

    expect(fixRelativeLinks('/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('/test.jpg', 'http://origin.com/path/to/current/page/')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('/test.jpg', 'http://origin.com:8080/path/to/current/page')).to.eql('http://origin.com:8080/test.jpg');
    done();
  });


  it('should fix URL patterns', function(done) {

    expect(fixUrlPattern('http://origin.com/test.jpg')).to.eql('http://origin.com/test.jpg');
    expect(fixUrlPattern('^http://origin.com/test.jpg')).to.eql('http://origin.com/test.jpg');
    expect(fixUrlPattern('^http://origin.com/test.jpg$')).to.eql('http://origin.com/test.jpg');
    expect(fixUrlPattern('http://origin.com/test.jpg$')).to.eql('http://origin.com/test.jpg');
  });


  it('should remove CDATA mark-ups', function(done) {

    expect(fixUrlPattern('this is a some content')).to.eql('this is a some content');
    expect(fixUrlPattern('<![cdata[this is a some content')).to.eql('this is a some content');
    expect(fixUrlPattern('<![cdata[this is a some content]]>')).to.eql('this is a some content');
    expect(fixUrlPattern('this is a some content]]>')).to.eql('this is a some content');
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote documents', function() {

    // Test resources are served by Karma
    loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml').then( function(xmlDoc) {
      expect(xmlDoc.documentElement.name).to.eql('root');
    });
  });

});
