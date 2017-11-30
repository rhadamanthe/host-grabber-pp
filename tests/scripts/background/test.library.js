'use strict';

describe('background => library', function() {

  // Test functions
  var failureFunction = function(done, fName) {
    return function() {
      done( new Error('The function ' + fName + ' was not supposed to be invoked.'));
    };
  };

  /**
   * The default test extractor (all methods fail).
   * @param {fn} done The completion callback.
   * @returns {object} A Test extractor.
   */
  function testExtractor(done) {
    return {
      replace: failureFunction(done, 'replace'),
      def: failureFunction(done, 'def'),
      xpath: failureFunction(done, 'xpath'),
      expreg: failureFunction(done, 'expreg')
    };
  }

  // Let's start the tests
  it('should invoke the right function for IDs', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    var extractor = testExtractor(done);
    extractor.xpath = function(sourceCode, expr) {
      expect(expr).to.equal('//img[@id=\'toto\']/@src');
      return [];
    };

    match('urlpattern', 'ID:toto', sourceDocument, 'url', extractor);
    match('urlpattern', ' ID : toto ', sourceDocument, 'url', extractor);
    match('urlpattern', ' id: toto', sourceDocument, 'url', extractor);
    done();
  });


  it('should invoke the right function for classes', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    var extractor = testExtractor(done);
    extractor.xpath = function(sourceCode, expr) {
      expect(expr).to.equal('//img[@class=\'toto\']/@src');
      return [];
    };

    match('urlpattern', 'class:toto', sourceDocument, 'url', extractor);
    match('urlpattern', ' class : toto ', sourceDocument, 'url', extractor);
    match('urlpattern', ' Class: toto', sourceDocument, 'url', extractor);
    done();
  });


  it('should invoke the right function for XPath', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    var extractor = testExtractor(done);
    extractor.xpath = function(sourceCode, expr) {
      expect(expr).to.equal('//div[@id=\'toto\']/img/@src');
      return [];
    };

    match('urlpattern', 'xpath://div[@id=\'toto\']/img/@src', sourceDocument, 'url', extractor);
    match('urlpattern', ' xpath : //div[@id=\'toto\']/img/@src ', sourceDocument, 'url', extractor);
    match('urlpattern', ' XPath: //div[@id=\'toto\']/img/@src', sourceDocument, 'url', extractor);
    done();
  });


  it('should invoke the right function for replacements', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    var extractor = testExtractor(done);
    extractor.replace = function(sourceDocument, urlPattern, toSearch, replacement) {
      expect(urlPattern).to.equal('http://toto.fr/view\.php');
      expect(toSearch).to.equal('view\.php');
      expect(replacement).to.equal('titi.jpg');
      return [];
    };

    match('http://toto.fr/view\.php', 'replace:\'view\.php\',\'titi.jpg\'', sourceDocument, 'url', extractor);
    match('http://toto.fr/view\.php', ' replace : \'view\.php\',\'titi.jpg\' ', sourceDocument, 'url', extractor);
    match('http://toto.fr/view\.php', ' Replace: \'view\.php\'   , \'titi.jpg\'', sourceDocument, 'url', extractor);
    done();
  });


  it('should invoke the right function for regular expressions', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    var extractor = testExtractor(done);
    extractor.expreg = function(sourceDocument, pattern) {
      expect(pattern).to.equal('.*\.jpg');
      return [];
    };

    match('http://toto.fr/view\.php', 'expreg: .*\.jpg', sourceDocument, 'url', extractor);
    match('http://toto.fr/view\.php', '  expReg : .*\.jpg   ', sourceDocument, 'url', extractor);
    done();
  });


  it('should invoke the right function for SELF', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    var extractor = testExtractor(done);
    extractor.expreg = function(sourceDocument, pattern) {
      expect(pattern).to.equal('http://toto.fr/view\.php/images/*.jpg');
      return [];
    };

    match('http://toto.fr/view\.php/images/*.jpg', 'self', sourceDocument, 'url', extractor);
    match('http://toto.fr/view\.php/images/*.jpg', '  SelF  ', sourceDocument, 'url', extractor);
    done();
  });


  it('should verify the XPath function with a single result', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = '<html><body><img src="http://titi.fr/gallery/t.jpg" class="paf" /></body></html>';

    var res = xpath(sourceDocument, '//img[@class=\'paf\']/@src');
    expect(res).to.eql(['http://titi.fr/gallery/t.jpg']);
    done();
  });


  it('should verify the XPath function with a several results', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t4.jpg" class="paf" />
    </body></html>
    `;

    var res = xpath(sourceDocument, '//img[@class=\'paf\']/@src');
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t4.jpg']);

    done();
  });


  it('should find the right links for classes', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t4.jpg" class="paf" />
    </body></html>
    `;

    var res = match('urlPattern', 'class: paf', sourceDocument, 'url', extractor());
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t4.jpg']);

    done();
  });


  it('should find the right links for XPath expressions', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t4.jpg" class="paf" />
    </body></html>
    `;

    var res = match('urlPattern', 'xpath: //img[@class=\'paf\']/@src', sourceDocument, 'url', extractor());
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t4.jpg']);

    done();
  });


  it('should find the right links for XPath IDs', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <br />
      <img src="http://titi.fr/gallery/t8.jpg" id="paf" />
      <br />
    </body></html>
    `;

    var res = match('urlPattern', 'id: paf', sourceDocument, 'url', extractor());
    expect(res).to.eql(['http://titi.fr/gallery/t8.jpg']);
    done();
  });


  it('should verify the replace function with a single result (simple replacement)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = '<html><body><img src="http://titi.fr/view.php?t.jpg" class="paf" /></body></html>';

    var res = replace(sourceDocument, 'http://titi.fr/([^"]*?)', 'view.php\\?', 'gallery/');
    expect(res).to.eql(['http://titi.fr/gallery/t.jpg']);
    done();
  });


  it('should verify the replace function with a single result (complex replacement)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = '<html><body><img src="http://titi.fr/view.php?t.jpg" class="paf" /></body></html>';

    var res = replace(sourceDocument, 'http://titi.fr/([^"]*)', 'view.php\\?(.*)', 'gallery/$1');
    expect(res).to.eql(['http://titi.fr/gallery/t.jpg']);
    done();
  });


  it('should verify the replace function with several results', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/view.php?t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/view.php?t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/view.php?t1.jpg" class="paf" />
      <img src="http://titi.fr/view.php?t9.jpg" class="paf" />
    </body></html>`;

    var res = replace(sourceDocument, 'http://titi.fr/([^"]*)', 'view.php\\?', 'gallery/');
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t9.jpg']);

    done();
  });


  it('should find the right links for replacements', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <br />
      <img src="http://titi.fr/gallery/t8.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/view.php?t1.jpg" class="paf" />
      <img src="http://titi.fr/view.php?t9.jpg" class="paf" />
    </body></html>
    `;

    var res = match('http://titi.fr/[^"]*', 'replace: \'view.php\\?\', \'gallery/\'', sourceDocument, 'url', extractor());
    expect(res).to.eql(['http://titi.fr/gallery/t8.jpg', 'http://titi.fr/gallery/t1.jpg', 'http://titi.fr/gallery/t9.jpg']);
    done();
  });


  it('should find the right links for replacements (with ^ and $ meta-characters)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <br />
      <img src="http://titi.fr/gallery/t8.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/view.php?t1.jpg" class="paf" />
      <img src="http://titi.fr/view.php?t9.jpg" class="paf" />
    </body></html>
    `;

    var res = match('^http://titi.fr/[^"]*$', 'replace: \'view.php\\?\', \'gallery/\'', sourceDocument, 'url', extractor());
    expect(res).to.eql(['http://titi.fr/gallery/t8.jpg', 'http://titi.fr/gallery/t1.jpg', 'http://titi.fr/gallery/t9.jpg']);
    done();
  });


  it('should verify the expreg function (no capture)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t5.gif" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t4.jpg" class="paf" />
    </body></html>
    `;

    var res = expreg(sourceDocument, 'http[^"].*\.jpg');
    expect(res).to.eql(['http://titi.fr/gallery/t1.jpg', 'http://titi.fr/gallery/t2.jpg', 'http://titi.fr/gallery/t4.jpg']);

    res = expreg(sourceDocument, 'http[^"].*\.gif');
    expect(res).to.eql(['http://titi.fr/gallery/t5.gif']);
    done();
  });


  it('should verify the expreg function (with capture)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <div class="toto">
        <a href="http://here.com/im1.jpg">Test 1</a>
      </div>
      <div class="toto"><a href="http://here.com/im4.jpg">Test 4</a></div>
      <div class="toto">
        <a href="http://here.com/im5.jpg">Test 5</a>
      </div>
    </body></html>
    `;

    var res = expreg(sourceDocument, '<div class="toto">\\s*<a href="(.*\.jpg)"');
    expect(res).to.eql(['http://here.com/im1.jpg', 'http://here.com/im4.jpg', 'http://here.com/im5.jpg']);
    done();
  });


  it('should find the right links for regular expressions', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t5.gif" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t4.jpg" class="paf" />
    </body></html>
    `;

    var res = match('urlPattern', 'expreg: http[^"].*\.jpg', sourceDocument, 'url', extractor());
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t4.jpg']);

    res = match('urlPattern', 'expreg: http[^"].*\.gif', sourceDocument, 'url', extractor());
    expect(res).to.eql(['http://titi.fr/gallery/t5.gif']);
    done();
  });


  it('should find the right links for SELF', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t2.jpg" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t5.gif" class="paf" />
      <br />
      <img src="http://titi.fr/gallery/t4.jpg" class="paf" />
    </body></html>
    `;

    var res = match('http[^"].*\.jpg', 'self', sourceDocument, 'url', extractor());
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t4.jpg']);

    res = match('http[^"].*\.gif', 'SELF', sourceDocument, 'url', extractor());
    expect(res).to.eql(['http://titi.fr/gallery/t5.gif']);
    done();
  });


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


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should test the loadDictionary and process functions before finding the right links', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.de/gallery/t2.jpg" />
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t5.gif" />
      <br />
      <img src="http://google.com/images/view.php?img=http://titi.fr/gallery/view.php?img=t5.gif" class="g" />
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadDictionary('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Extract links
      var res = process(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

      // Verify we got them all (order might be different!)
      expect(res.sort()).to.eql([
        'http://titi.fr/gallery/images/t1.jpg',
        'http://titi.fr/gallery/images/t5.gif',
        'http://titi.fr/gallery/images/t4.jpg',
        'http://mimi.de/gallery/t2.jpg',
        'http://bibi.com/path/to/this/image1.PNG'].sort());
    });
  });


  it('should test the loadDictionary and process functions before finding the right links (CDATA)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <div class="photo"><a href="test1.jpg">t1</a></div>
      <div class="photo">
        <a href="test2.jpg">t2</a>
      </div>
      <div class="photo"><a href="../test3.jpg">t3</a></div>
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadDictionary('http://localhost:9876/base/tests/resources/host.background.library.test.cdata.xml');
    return dictionaryP.then( function(dictionary) {

      // Extract links
      var res = process(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

      // Verify we got them all (order might be different!)
      expect(res.sort()).to.eql([
        'http://web.page.url.com/we/do/not/care/here/test1.jpg',
        'http://web.page.url.com/we/do/not/care/here/test2.jpg',
        'http://web.page.url.com/we/do/not/care/test3.jpg'].sort());
    });
  });


  it('should test the loadDictionary and process functions before finding the right links (Relative Paths)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="gallery/t1.jpg" class="paf" />
      <br />
      <img src="gallery/t2.jpg" class="paf" />
      <img src="/top/gallery/t3.jpg" class="paf" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    dictionary.documentElement.innerHTML = `<root>
        <host id="titi">
          <urlpattern>^http://www\.titi\.fr/.+</urlpattern>
          <searchpattern>expreg: src="(.*\.jpg)"</searchpattern>
        </host>
      </root>
    `;

    // Extract links
    var res = process(sourceDocument, 'http://titi.fr', dictionary);

    // Verify we got them all (order might be different!)
    expect(res.sort()).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/top/gallery/t3.jpg'].sort());

    done();
  });

});
