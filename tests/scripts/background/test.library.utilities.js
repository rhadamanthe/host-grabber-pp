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
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test_spec_1.1.xml').then( function(xmlDoc) {
      expect(xmlDoc.documentElement.tagName).to.eql('root');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote documents, even when forcing the MIME type', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test_spec_1.1.xml', true, 'text/xml').then( function(xmlDoc) {
      expect(xmlDoc.documentElement.tagName).to.eql('root');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should load remote documents as text files', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test_spec_1.1.xml', false).then( function(sourceAsText) {
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


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should fail to load this invalid XML document (MIME type forced, like for dictionary download)', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/invalid-xml2.html', true, 'text/xml').then( function(xmlDoc) {
      expect().fail('This function should not have been invoked!');

    }, function(error) {
      // The document was correctly download but is not a valid XML
      expect(error.status).to.eql(200);
      expect(error.statusText).to.eql('Invalid XML document.');
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should fail to load this invalid XML document (no MIME type forced)', function() {

    // Test resources are served by Karma
    return loadRemoteDocument('http://localhost:9876/base/tests/resources/invalid-xml2.html').then( function(xmlDoc) {
      // When the MIME type is not forced, the browser can repair
      // invalid XML documents as HTML pages.

    }, function(error) {
      expect().fail('This function should not have been invoked!');
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


  it('should build domain patterns correctly', function(done) {

    // When we read a pattern from a file, a single back-slash is enough: "\.jpg"
    // But when specifying a pattern from the code, double back-slashes are necessary: "\\.jpg"

    var res = buildDomainPattern('toto.fr');
    expect(res).to.eql('https?://([-\\w]+\\.)*toto\\.fr');

    res = buildDomainPattern(new RegExp('toto\\.fr'));
    expect(res).to.eql('https?://([-\\w]+\\.)*toto\\.fr');

    res = buildDomainPattern(new RegExp('domain\\d'));
    expect(res).to.eql('https?://([-\\w]+\\.)*domain\\d');

    res = buildDomainPattern(new RegExp('.*'));
    expect(res).to.eql('https?://([-\\w]+\\.)*[^<>"/]*');
    done();
  });


  it('should build URL patterns correctly', function(done) {

    // When we read a pattern from a file, a single back-slash is enough: "\.jpg"
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

    // Introducing &dot; in the pattern
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', 'my-domain.org', '&dot;*\\.jpg', 'host-id4');
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

    // Support domain patterns
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', new RegExp('.*'), '.*\\.jpg', 'host-id7');
    expect(res.length).to.eql(4);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*[^<>"/]*/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);

    expect(res[1].pattern).to.eql('src\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[1].excludeHost).to.eql(true);

    expect(res[2].pattern).to.eql('href\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[2].excludeHost).to.eql(true);

    expect(res[3].pattern).to.eql('data-src\s*=\s*"(/?[^:"]*[^<>"]*\\.jpg)"');
    expect(res[3].excludeHost).to.eql(true);

    // Support domain patterns with an escaped dot
    res = buildUrlPatterns('http://my-other-domain.fr/some/dir/page.html', new RegExp('toto\d+\.fr'), '.*\\.jpg', 'host-id8');
    expect(res.length).to.eql(1);
    expect(res[0].pattern).to.eql('"(https?://([-\\w]+\\.)*toto\d+\.fr/[^<>"]*\\.jpg)"');
    expect(res[0].excludeHost).to.eql(false);
    done();
  });


  it('should prepare a processor for messaging correctly', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'origin url');
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

    var p1 = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'origin url');
    var p2 = newProcessor('http://this.is.another/matching/url', 'page title', {}, 'origin url');

    var res = prepareProcessorsForMessaging([ p1, p2 ]);
    expect(res.length).to.eql(2);
    done();
  });


  it('should verify the building of download options (default strategy)', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/file.jpg',
      fileName: 'file.jpg',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DEFAULT);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('file.jpg');

    options = buildDownloadOptions(dlLink, p, '00005_', DL_STRATEGY_DEFAULT);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('00005_file.jpg');

    dlLink.fileName = 'force-this-name.png';
    options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DEFAULT);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('force-this-name.png');

    options = buildDownloadOptions(dlLink, p, '00005_', DL_STRATEGY_DEFAULT);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('00005_force-this-name.png');

    done();
  });


  it('should verify the building of download options (invalid strategy => default)', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/file.jpg',
      fileName: 'file.jpg',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', -87);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('file.jpg');

    options = buildDownloadOptions(dlLink, p, '0124_', -87);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('0124_file.jpg');

    done();
  });


  it('should verify the building of download options (by domain)', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/file.jpg',
      fileName: 'file.jpg',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DIR_PER_DOMAIN);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('origin.url/file.jpg');

    options = buildDownloadOptions(dlLink, p, '0001-', DL_STRATEGY_DIR_PER_DOMAIN);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('origin.url/0001-file.jpg');

    done();
  });


  it('should verify the building of download options (by domain, with www. and complex URL)', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://www.origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/index.php#anchor?file.jpg',
      fileName: 'index.php',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DIR_PER_DOMAIN);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php#anchor?file.jpg');
    expect(options.filename).to.be('origin.url/index.php');

    options = buildDownloadOptions(dlLink, p, 'some_prefix_', DL_STRATEGY_DIR_PER_DOMAIN);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php#anchor?file.jpg');
    expect(options.filename).to.be('origin.url/some_prefix_index.php');

    done();
  });


  it('should verify the building of download options (by alpha date)', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://www.origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/index.php?file.jpg#anchor',
      fileName: 'index.php',
      status: DlStatus.WAITING
    };

    var now = new Date();
    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DIR_PER_ALPHA_DATE);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');

    var day = ('0' + now.getDate()).slice(-2);
    var expectedDate = now.getFullYear() +
      '-' + ('0' + (now.getMonth() + 1)).slice(-2) +
      '-' + day;

    var expected = buildDlDirectoryFromPattern(now, expectedDate, p);
    expect(options.filename).to.be(expected + '/index.php');

    options = buildDownloadOptions(dlLink, p, '123-', DL_STRATEGY_DIR_PER_ALPHA_DATE);
    expect(options.filename).to.be(expected + '/123-index.php');

    done();
  });


  it('should verify the building of download options (by tree date)', function(done) {

    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://www.origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/index.php?file.jpg#anchor',
      fileName: 'index.php',
      status: DlStatus.WAITING
    };

    var now = new Date();
    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DIR_PER_TREE_DATE);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');

    var day = ('0' + now.getDate()).slice(-2);
    var expectedDate = now.getFullYear() +
      '/' + ('0' + (now.getMonth() + 1)).slice(-2) +
      '/' + day;

    var expected = buildDlDirectoryFromPattern(now, expectedDate, p);
    expect(options.filename).to.be(expected + '/index.php');

    options = buildDownloadOptions(dlLink, p, 'prefix0_', DL_STRATEGY_DIR_PER_TREE_DATE);
    expect(options.filename).to.be(expected + '/prefix0_index.php');

    done();
  });


  it('should verify the building of download options (by page title)', function(done) {

    var p = newProcessor(
      'http://this.is.the/matching/url',
      'APPEARANCE - Someone famous - Entertainment Weekly Pre-SAG Party in Los Angeles! - 01/26/19 | Art Forum',
      {},
      'https://www.origin.url/dir');

    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/file.jpg',
      fileName: 'file.jpg',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_DIR_PER_PAGE_TITLE);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('APPEARANCE_Someone_famous_Entertainment_Weekly_Pre_SAG_Party_in_Los_Angeles_01_26_19_Art_Forum/file.jpg');

    options = buildDownloadOptions(dlLink, p, '00001-', DL_STRATEGY_DIR_PER_PAGE_TITLE);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/file.jpg');
    expect(options.filename).to.be('APPEARANCE_Someone_famous_Entertainment_Weekly_Pre_SAG_Party_in_Los_Angeles_01_26_19_Art_Forum/00001-file.jpg');

    done();
  });


  it('should verify the building of download options (custom pattern)', function(done) {

    var now = new Date();
    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://www.origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/index.php?file.jpg#anchor',
      fileName: 'index.php',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_CUSTOM, '%year%');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be(now.getFullYear() + '/index.php');

    options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_CUSTOM, '%year%/%day%/');
    var day = ('0' + now.getDate()).slice(-2);

    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be(now.getFullYear() + '/' + day + '/index.php');

    options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_CUSTOM, '%year%/fix/%domain%/');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be(now.getFullYear() + '/fix/origin.url/index.php');

    options = buildDownloadOptions(dlLink, p, '845_', DL_STRATEGY_CUSTOM, '%year%/fix/%domain%/');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be(now.getFullYear() + '/fix/origin.url/845_index.php');

    done();
  });


  it('should verify the building of download options (user prompt)', function(done) {

    var now = new Date();
    var p = newProcessor('http://this.is.the/matching/url', 'page title', {}, 'https://www.origin.url/dir');
    var dlLink = {
      id: p.id + '-1',
      link: 'https://web.host.net/directory/index.php?file.jpg#anchor',
      fileName: 'index.php',
      status: DlStatus.WAITING
    };

    var options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_CUSTOM);
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be('index.php');

    options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_CUSTOM, 'not-using-prompt');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be('not-using-prompt/index.php');

    options = buildDownloadOptions(dlLink, p, '0005_', DL_STRATEGY_CUSTOM, 'not-using-prompt');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be('not-using-prompt/0005_index.php');

    options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_PROMPT_USER, 'not-using-prompt');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be('index.php');

    p.promptedDirectoryName = '%year%--something-personal';
    options = buildDownloadOptions(dlLink, p, '', DL_STRATEGY_PROMPT_USER, 'not-using-prompt');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be(now.getFullYear() + '--something-personal/index.php');

    options = buildDownloadOptions(dlLink, p, '0008_', DL_STRATEGY_PROMPT_USER, 'not-using-prompt');
    expect(options.saveAs).to.eql(false);
    expect(options.conflictAction).to.eql('uniquify');
    expect(options.url).to.eql('https://web.host.net/directory/index.php?file.jpg#anchor');
    expect(options.filename).to.be(now.getFullYear() + '--something-personal/0008_index.php');

    done();
  });


  it('should verify the construction of the sub-directory path for downloads', function(done) {

    var date = new Date(2018, 10, 30, 17, 21);
    var p = newProcessor(
      'http://this.is.the/matching/url',
      'page title',
      {},
      'https://www.origin.url/dir');

    expect(buildDlDirectoryFromPattern(date, DL_DIR_DATE_YEAR, p)).to.eql('2018');
    expect(buildDlDirectoryFromPattern(date, DL_DIR_DATE_MONTH, p)).to.eql('11');
    expect(buildDlDirectoryFromPattern(date, DL_DIR_DATE_DAY, p)).to.eql('30');
    expect(buildDlDirectoryFromPattern(date, DL_DIR_DATE_HOUR, p)).to.eql('18');
    expect(buildDlDirectoryFromPattern(date, DL_DIR_DATE_MINUTE, p)).to.eql('21');
    expect(buildDlDirectoryFromPattern(date, DL_DIR_PAGE_TITLE, p)).to.eql('page_title');
    expect(buildDlDirectoryFromPattern(date, DL_DIR_PAGE_DOMAIN, p)).to.eql('origin.url');
    expect(buildDlDirectoryFromPattern(date, 'my/constant', p)).to.eql('my/constant');
    expect(buildDlDirectoryFromPattern(date, 'my/ct-' + DL_DIR_DATE_DAY, p)).to.eql('my/ct-30');

    done();
  });


  it('should be able to verify download items', function(done) {

    var downloadItem = {};
    downloadItem.fileSize = 5874;
    downloadItem.mime = 'image/jpeg';

    var analysisResult = verifyDownloadedItem(downloadItem);
    expect(analysisResult.code).to.eql(0);

    downloadItem.mime = 'text/html';
    analysisResult = verifyDownloadedItem(downloadItem);
    expect(analysisResult.code).to.eql(DlStatus.INVALID_MIME_TYPE);
    expect(analysisResult.details).to.eql('text/html');

    downloadItem.fileSize = 1874;
    downloadItem.mime = 'image/jpeg';
    analysisResult = verifyDownloadedItem(downloadItem);
    expect(analysisResult.code).to.eql(DlStatus.UNEXPECTED_SMALL_SIZE);

    delete downloadItem.fileSize;
    downloadItem.mime = 'image/jpeg';
    analysisResult = verifyDownloadedItem(downloadItem);
    expect(analysisResult.code).to.eql(0);

    delete downloadItem.mime;
    analysisResult = verifyDownloadedItem(downloadItem);
    expect(analysisResult.code).to.eql(0);

    downloadItem.fileSize = -1;
    analysisResult = verifyDownloadedItem(downloadItem);
    expect(analysisResult.code).to.eql(0);
    done();
  });


  it('should build a valid dictionary for direct images', function(done) {

    var dictionaryWrapper = buildDictionaryWrapperForDirectImages();
    expect(dictionaryWrapper.errors.length).to.eql(0);
    done();
  });


  it('should verify file names are found correctly)', function(done) {

    expect('index.php').to.eql(findFileName(
      'https://web.host.net/directory/index.php#anchor?file.jpg',
      '',
      []));

    expect('file.jpg').to.eql(findFileName(
      'https://web.host.net/directory/file.jpg',
      '',
      []));

    expect('').to.eql(findFileName(
      'https://web.host.net/directory/',
      '',
      []));

    expect('directory').to.eql(findFileName(
      'https://web.host.net/directory',
      '',
      []));

    expect('toto.png').to.eql(findFileName(
      'https://web.host.net/directory/file.jpg',
      'toto.png',
      []));

    let interceptors = [
      {replace: '\.png', by: '.jpg'},
      {replace: '\.jpg', by: '.webp'},
      {replace: '^(\\d+)$', by: '$1.jpg'}];

    expect('toto.webp').to.eql(findFileName(
      'https://web.host.net/directory/file.jpg',
      'toto.png',
      interceptors));

    expect('file.webp').to.eql(findFileName(
      'https://web.host.net/directory/file.jpg',
      '',
      interceptors));

    expect('1489.jpg').to.eql(findFileName(
      'https://web.host.net/directory/1489',
      '',
      interceptors));

    done();
  });
});
