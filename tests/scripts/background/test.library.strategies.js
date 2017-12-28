'use strict';

describe('background => library.strategies', function() {


  it('should verify the SELF function', function(done) {

    var ext = extractor();
    var res = ext.self('htp://toto.fr');
    expect(res).to.eql(['htp://toto.fr']);
    done();
  });


  it('should verify the XPath function with a single result', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = '<html><body><img src="http://titi.fr/gallery/t.jpg" class="paf" /></body></html>';

    var ext = extractor();
    var res = ext.xpath(sourceDocument, '//img[@class=\'paf\']/@src');
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

    var ext = extractor();
    var res = ext.xpath(sourceDocument, '//img[@class=\'paf\']/@src');
    expect(res).to.eql([
      'http://titi.fr/gallery/t1.jpg',
      'http://titi.fr/gallery/t2.jpg',
      'http://titi.fr/gallery/t4.jpg']);

    done();
  });


  it('should verify the replace function with a simple replacement', function(done) {

    var ext = extractor();
    var res = ext.replace('http://titi.fr/view.php?t.jpg', 'view.php\\?', 'gallery/');
    expect(res).to.eql(['http://titi.fr/gallery/t.jpg']);
    done();
  });


  it('should verify the replace function with a complex replacement', function(done) {

    var ext = extractor();
    var res = ext.replace('http://titi.fr/view.php?t.jpg', 'view.php\\?(.*)', 'gallery/$1');
    expect(res).to.eql(['http://titi.fr/gallery/t.jpg']);
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

    var ext = extractor();
    var res = ext.expreg(sourceDocument, 'http[^"]+\.jpg');
    expect(res).to.eql(['http://titi.fr/gallery/t1.jpg', 'http://titi.fr/gallery/t2.jpg', 'http://titi.fr/gallery/t4.jpg']);

    res = ext.expreg(sourceDocument, 'http[^"]+\.gif');
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

    var ext = extractor();
    var res = ext.expreg(sourceDocument, '<div class="toto">\\s*<a href="([^"]+\.jpg)"');
    expect(res).to.eql(['http://here.com/im1.jpg', 'http://here.com/im4.jpg', 'http://here.com/im5.jpg']);
    done();
  });
});
