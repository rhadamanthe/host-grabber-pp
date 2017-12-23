'use strict';

describe('background => library', function() {























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
