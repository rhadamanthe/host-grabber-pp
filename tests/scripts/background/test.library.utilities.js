'use strict';

describe('background => library.utilities', function() {

  it('should fix relative links correctly', function(done) {

    expect(fixRelativeLinks('http://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://toto.fr/test.jpg');
    expect(fixRelativeLinks('https://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('https://toto.fr/test.jpg');
    expect(fixRelativeLinks('//toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://toto.fr/test.jpg');
    expect(fixRelativeLinks('ftp://toto.fr/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('ftp://toto.fr/test.jpg');

    expect(fixRelativeLinks('test.jpg', 'http://origin.com/path/to/current/page/')).to.eql('http://origin.com/path/to/current/page/test.jpg');
    expect(fixRelativeLinks('test.jpg', 'http://origin.com/path/to/current/page.php')).to.eql('http://origin.com/path/to/current/test.jpg');    expect(fixRelativeLinks('test.jpg', 'http://origin.com')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('test.jpg', 'http://origin.com/dir/')).to.eql('http://origin.com/dir/test.jpg');
    expect(fixRelativeLinks('test.jpg', 'http://origin.com/path/page?value=toto.jpg')).to.eql('http://origin.com/path/test.jpg');
    expect(fixRelativeLinks('../../images/test.jpg', 'http://origin.com/path/to/current/page/')).to.eql('http://origin.com/path/to/images/test.jpg');
    expect(fixRelativeLinks('../../images/test.jpg', 'http://origin.com/path/to/current/page.html')).to.eql('http://origin.com/path/images/test.jpg');

    expect(fixRelativeLinks('/test.jpg', 'http://origin.com/path/to/current/page')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('/test.jpg', 'http://origin.com/path/to/current/page/')).to.eql('http://origin.com/test.jpg');
    expect(fixRelativeLinks('/test.jpg', 'http://origin.com:8080/path/to/current/page')).to.eql('http://origin.com:8080/test.jpg');
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


  it('should remove items from an array', function(done) {

    var arr = [{id: 1}, {id: 2}, {id: 1}];
    expect(arr.length).to.eql(3);

    removeFromArray(arr, arr[0]);
    expect(arr.length).to.eql(2);
    expect(arr).to.eql([{id: 2}, {id: 1}]);

    removeFromArray(arr, {id: 4});
    expect(arr.length).to.eql(2);
    done();
  });


  it('should detect invalid domains when building URL patterns', function(done) {

    var res = buildUrlPatterns('', 'http://my-domain.org', '.*\\.jpg', 'host-id');
    expect(res.length).to.eql(0);
    done();
  });


  it('should detect invalid path patterns when building URL patterns', function(done) {

    var res = buildUrlPatterns('', 'my-domain.org', '^.*\\.jpg', 'host-id1');
    expect(res.length).to.eql(0);

    res = buildUrlPatterns('', 'my-domain.org', '/.*\\.jpg', 'host-id2');
    expect(res.length).to.eql(0);

    res = buildUrlPatterns('', 'my-domain.org', '.*\\.jpg$', 'host-id3');
    expect(res.length).to.eql(0);
    done();
  });


  it('should detect build URL patterns correctly', function(done) {

    // When we ready a pattern from a file, a single back-slash is enough: "\.jpg"
    // But when specifying a pattern from the code, double back-slashes are necessary: "\\.jpg"

    // Verify first how the '.' meta-character is handled
    var res = buildUrlPatterns('', 'my-domain.org', '.*\\.jpg', 'host-id1');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    res = buildUrlPatterns('', 'my-domain.org', '.+\\.jpg', 'host-id1');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]+\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    res = buildUrlPatterns('', 'my-domain.org', '.{23}\\.jpg', 'host-id1');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]{23}\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    res = buildUrlPatterns('', 'my-domain.org', '.{23,}\\.jpg', 'host-id1');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]{23,}\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    res = buildUrlPatterns('', 'my-domain.org', '.{23,27}\\.jpg', 'host-id1');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]{23,27}\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    res = buildUrlPatterns('', 'my-domain.org', '[^"/.]+\\.jpg', 'host-id1');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^"/.]+\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    // With an URL this time
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', 'my-domain.org', '.*\\.jpg', 'host-id2');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    // Pattern with a sub-directory
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', 'my-domain.org', 'gallery/.*\\.jpg', 'host-id3');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/gallery/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    // Introducing &dot in the pattern
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', 'my-domain.org', '&dot*\\.jpg', 'host-id4');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/.*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    // Introducing &amp;, &lt; and &gt; in the pattern
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', 'my-domain.org', 'dir1/dir2/[&lt;&gt;"&amp;]+\\.(png|jpg)', 'host-id5');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/dir1/dir2/[<>"&]+\\.(png|jpg))"');
    expect(res[0].excludeHost).to.eql(false);

    // The URL matches the domain (HTTPS)
    res = buildUrlPatterns('https://my-domain.org/some/dir/page.html', 'my-domain.org', '.*\\.jpg', 'host-id6');
    expect(res.length).to.eql(4);

    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    expect(res[1].pattern).to.eql('src\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[1].excludeHost).to.eql(true);

    expect(res[2].pattern).to.eql('href\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[2].excludeHost).to.eql(true);

    expect(res[3].pattern).to.eql('data-src\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[3].excludeHost).to.eql(true);

    // The URL matches the domain and we insert 'www' in the URL
    res = buildUrlPatterns('http://www.my-domain.org/some/dir/page.html', 'my-domain.org', '.*\\.jpg', 'host-id6');
    expect(res.length).to.eql(4);

    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*my-domain\\.org/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    expect(res[1].pattern).to.eql('src\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[1].excludeHost).to.eql(true);

    expect(res[2].pattern).to.eql('href\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[2].excludeHost).to.eql(true);

    expect(res[3].pattern).to.eql('data-src\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[3].excludeHost).to.eql(true);
    done();
  });


  it('should prepare a processor for messaging correctly', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'search-pattern', []);
    p.status = ProcessorStatus.SUCCESS;
    p.downloadLinks.push({
      id: 'i2',
      link: '1',
      status: DlStatus.WAITING
    });

    p.downloadLinks.push({
      id: 'iop',
      link: '2',
      status: DlStatus.SUCCESS,
      downloadItemId: 97
    });

    var res = prepareProcessorForMessaging(p);
    expect(res.id).to.eql(p.id);
    expect(res.status).to.eql(p.status);
    expect(res.matchingUrl).to.eql(p.matchingUrl);
    expect(res.downloadLinks.length).to.eql(2);
    expect(Object.keys( res ).length).to.eql(4);

    expect(res.downloadLinks[0].id).to.eql('i2');
    expect(res.downloadLinks[0].link).to.eql('1');
    expect(res.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    expect(Object.keys( res.downloadLinks[ 0 ]).length).to.eql(3);

    expect(res.downloadLinks[1].id).to.eql('iop');
    expect(res.downloadLinks[1].link).to.eql('2');
    expect(res.downloadLinks[1].status).to.eql(DlStatus.SUCCESS);
    expect(res.downloadLinks[1].downloadItemId).to.eql(97);
    expect(Object.keys( res.downloadLinks[ 1 ]).length).to.eql(4);

    done();
  });


  it('should prepare processors for messaging correctly', function(done) {

    var p1 = newProcessor('http://this.is.the/matching/url', 'search-pattern1', []);
    var p2 = newProcessor('http://this.is.another/matching/url', 'search-pattern2', []);

    var res = prepareProcessorsForMessaging([ p1, p2 ]);
    expect(res.length).to.eql(2);
    done();
  });
});
