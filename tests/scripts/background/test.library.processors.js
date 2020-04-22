'use strict';

describe('background => library.processors', function() {

  /**
   * Creates an attribute.
   * @param {object} element A DOM element.
   * @param {string} attributeName The attribute name.
   * @param {string} attributeValue The attribute value.
   * @return {undefined}
   */
  function createAttribute(element, attributeName, attributeValue) {
    var att = element.ownerDocument.createAttribute(attributeName);
    att.value = attributeValue;
    element.setAttributeNode(att);
  }


  it('should find what to process', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <img src="http://titi.fr/gallery/view.php?img=t2.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
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
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

      // Verify we got them all
      expect(res.length).to.eql(6);

      expect(res[0].matchingUrl).to.eql('http://mimi.net/gallery/t2.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);

      expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t1.jpg');
      expect(res[1].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t2.jpg');
      expect(res[2].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[3].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t5.gif');
      expect(res[3].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[4].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
      expect(res[4].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[5].matchingUrl).to.eql('http://bibi.com/path/to/this/image1.PNG');
      expect(res[5].extMethod).to.eql(ExtMethods.SELF.id);
    });
  });


  it('should find nothing to process when the source document is null', function() {

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);
      var res = findWhatToProcess(null, 'http://titi.fr/page.html', dictionaryWrapper);
      expect(res.length).to.eql(0);
    });
  });


  it('should find what to process (with relative and absolute links)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <img src="http://titi.fr/gallery/view.php?img=t2.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="https://titi.fr/gallery/view.php?img=t5.gif" />
      <br />
      <img src="http://google.com/images/view.php?img=http://titi.fr/gallery/view.php?img=t5.gif" class="g" />
      <img src="../../gallery/view.php?img=t14.jpg" class="paf" /><!--relative link -->
      <img src="../../gallery/view.php?img=t2.jpg" class="paf" /><!--relative link but duplicate -->

      <img src="/gallery/view.php?img=t101.jpg" class="paf" /><!--absolute link -->
      <img src="/gallery/view.php?img=t2.jpg" class="paf" /><!--absolute link but duplicate -->
      <img src="../../gallery/view.php?img=29.png" class="paf" /><!--relative link -->
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <div class="ct">
        <img src="http://c91-23.ca/to/this/image3.jpg" />
        <img src="http://c91-23.ca/to/this/image4.jpg" />
        <img src="http://c91-23.ca/to/this/image3.jpg" />
        <div>
          <img src="http://c91-23.ca/it/should/not/be/ignored.jpg" />
        </div>
      </div>
      
      <img src="http://bibi.com/path/to/this/image3.jpg" />
      <div class="not-ct">
        <img src="http://c91-23.ca/it/should/not/be/ignored/either.jpg" />
      </div>
      <div class="ct">
        <img src="http://c91-23.ca/to/image5.jpg" />
      </div>

      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://titi.fr/some-folder/at-second-level/some-web-page.html', dictionaryWrapper);

      // Verify we got them all
      expect(res.length).to.eql(16);

      expect(res[0].matchingUrl).to.eql('http://mimi.net/gallery/t2.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);

      expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t1.jpg');
      expect(res[1].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t2.jpg');
      expect(res[2].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[3].matchingUrl).to.eql('https://titi.fr/gallery/view.php?img=t5.gif');
      expect(res[3].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[4].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
      expect(res[4].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[5].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t14.jpg');
      expect(res[5].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[6].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t101.jpg');
      expect(res[6].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[7].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=29.png');
      expect(res[7].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[8].matchingUrl).to.eql('http://bibi.com/path/to/this/image3.jpg');
      expect(res[8].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[9].matchingUrl).to.eql('http://bibi.com/path/to/this/image1.PNG');
      expect(res[9].extMethod).to.eql(ExtMethods.SELF.id);

      // This matching URL appears twice but because it matches two different processors
      // (two dictionary items that target the same domain).
      expect(res[10].matchingUrl).to.eql('http://bibi.com/path/to/this/image3.jpg');
      expect(res[10].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[11].matchingUrl).to.eql('http://c91-23.ca/to/this/image3.jpg');
      expect(res[11].extMethod).to.eql(ExtMethods.CSS_QUERY.id);

      expect(res[12].matchingUrl).to.eql('http://c91-23.ca/to/this/image4.jpg');
      expect(res[12].extMethod).to.eql(ExtMethods.CSS_QUERY.id);

      expect(res[13].matchingUrl).to.eql('http://c91-23.ca/it/should/not/be/ignored.jpg');
      expect(res[13].extMethod).to.eql(ExtMethods.CSS_QUERY.id);

      expect(res[14].matchingUrl).to.eql('http://c91-23.ca/it/should/not/be/ignored/either.jpg');
      expect(res[14].extMethod).to.eql(ExtMethods.CSS_QUERY.id);

      expect(res[15].matchingUrl).to.eql('http://c91-23.ca/to/image5.jpg');
      expect(res[15].extMethod).to.eql(ExtMethods.CSS_QUERY.id);
    });
  });


  it('should find what to process (with relative and absolute links + sub-domain)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <img src="http://titi.fr/gallery/view.php?img=t2.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="https://titi.fr/gallery/view.php?img=t5.gif" />
      <br />
      <img src="http://google.com/images/view.php?img=http://titi.fr/gallery/view.php?img=t5.gif" class="g" />
      <img src="../../gallery/view.php?img=t14.jpg" class="paf" /><!--relative link -->
      <img src="../../gallery/view.php?img=t2.jpg" class="paf" />
      <!--relative link and not duplicate because of the sub-domain -->

      <img src="/gallery/view.php?img=t101.jpg" class="paf" /><!--absolute link -->
      <img src="/gallery/view.php?img=t2.jpg" class="paf" />
      <!--absolute link but duplicate of the relative link -->
      <img src="../../gallery/view.php?img=29.png" class="paf" /><!--relative link -->
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" />

      <div class="ct">
        <img src="http://c91-23.ca/to/image5.jpg" />
      </div>
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://sub-p1.titi.fr/some-folder/at-second-level/some-web-page.html', dictionaryWrapper);

      // Verify we got them all
      expect(res.length).to.eql(11);

      expect(res[0].matchingUrl).to.eql('http://mimi.net/gallery/t2.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);

      expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t1.jpg');
      expect(res[1].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t2.jpg');
      expect(res[2].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[3].matchingUrl).to.eql('https://titi.fr/gallery/view.php?img=t5.gif');
      expect(res[3].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[4].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
      expect(res[4].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[5].matchingUrl).to.eql('http://sub-p1.titi.fr/gallery/view.php?img=t14.jpg');
      expect(res[5].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[6].matchingUrl).to.eql('http://sub-p1.titi.fr/gallery/view.php?img=t2.jpg');
      expect(res[6].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[7].matchingUrl).to.eql('http://sub-p1.titi.fr/gallery/view.php?img=t101.jpg');
      expect(res[7].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[8].matchingUrl).to.eql('http://sub-p1.titi.fr/gallery/view.php?img=29.png');
      expect(res[8].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[9].matchingUrl).to.eql('http://bibi.com/path/to/this/image1.PNG');
      expect(res[9].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[10].matchingUrl).to.eql('http://c91-23.ca/to/image5.jpg');
      expect(res[10].extMethod).to.eql(ExtMethods.CSS_QUERY.id);
    });
  });


  it('should find what to process (with relative and absolute links + domain patterns)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://toto.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="https://toto4.fr/gallery/p1.jpg" />
      <img src="http://tito4.fr/gallery/p2.jpg" />
      <img src="http://toto14.fr/gallery/p3.jpg" />
      <img src="http://toto14.fr/gallery/p43.jpg" />
      <br />
      <img src="http://google.com/images/view.php?img=http://toto.fr/gallery/view.php?img=t5.jpg" class="g" />
      <img src="../../gallery/p_194.jpg" class="paf" /><!--relative link -->
      <br />
      <img src="http://bibi.com/path/to/this/image1.jpg" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.domain-pattern.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://toto2.fr/some-folder/at-second-level/some-web-page.html', dictionaryWrapper);

      // Verify we got them all
      expect(res.length).to.eql(5);

      expect(res[0].matchingUrl).to.eql('http://toto.fr/gallery/view.php?img=t1.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[1].matchingUrl).to.eql('https://toto4.fr/gallery/p1.jpg');
      expect(res[1].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[2].matchingUrl).to.eql('http://toto14.fr/gallery/p3.jpg');
      expect(res[2].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[3].matchingUrl).to.eql('http://toto14.fr/gallery/p43.jpg');
      expect(res[3].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[4].matchingUrl).to.eql('http://toto2.fr/gallery/p_194.jpg');
      expect(res[4].extMethod).to.eql(ExtMethods.SELF.id);
    });
  });


  it('should find what to process (when there are redirections)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://host1.com/another/path/to/this/image1.jpg" />
      <img src="http://host2.com/another/path/to/this/image1.jpg" />
      <img src="http://host1.com/another/path/to/this/image2.jpg" />
      <img src="http://host3.com/path/to/this/image1.jpg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

      // Verify we got them all.
      // The only valid redirection is about host1. Others are not redirected.
      expect(res.length).to.eql(5);

      expect(res[0].matchingUrl).to.eql('http://bibi.com/path/to/this/image1.PNG');
      expect(res[0].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[1].matchingUrl).to.eql('http://host_1.com/another/path/to/this/image1.jpg');
      expect(res[1].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[2].matchingUrl).to.eql('http://host_1.com/another/path/to/this/image2.jpg');
      expect(res[2].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[3].matchingUrl).to.eql('http://host2.com/another/path/to/this/image1.jpg');
      expect(res[3].extMethod).to.eql(ExtMethods.SELF.id);

      expect(res[4].matchingUrl).to.eql('http://host3.com/path/to/this/image1.jpg');
      expect(res[4].extMethod).to.eql(ExtMethods.SELF.id);
    });
  });


  it('should find what to process (with CDATA and array of dictionaries)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/test/photos/view?t2.jpg" />
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
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.cdata.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', [dictionaryWrapper]);

      // Verify we got them all
      expect(res.length).to.eql(1);

      expect(res[0].matchingUrl).to.eql('http://mimi.net/test/photos/view?t2.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);
      expect(res[0].searchPattern).to.eql('expreg: ">\\s*<a href="([^"]+)">');
    });
  });


  it('should find what to process (with current domain)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="/gallery/path/to/thumb_05.jpg" class="paf" />
      <img src="http://titi.fr/path/to/the/thumb_001~01.jpg" />
      <br />
      <img src="http://mimi.net/path/to/thumb_001~02.jpg" />
      <img src="gallery2/path/to/thumb_191.jpg" />
      <br />
      <img src="https://titi.fr/gallery/view.php?img=t5.gif" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.no-domain.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://titi.fr/some-folder/at-second-level/some-web-page.html', dictionaryWrapper);

      // Verify we got them all
      expect(res.length).to.eql(3);

      expect(res[0].matchingUrl).to.eql('http://titi.fr/path/to/the/thumb_001~01.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/path/to/thumb_05.jpg');
      expect(res[1].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);

      expect(res[2].matchingUrl).to.eql('http://titi.fr/some-folder/at-second-level/gallery2/path/to/thumb_191.jpg');
      expect(res[2].extMethod).to.eql(ExtMethods.REPLACE.id);
      expect(ExtMethods.REPLACE.pattern.lastIndex).to.eql(0);
    });
  });


  it('should find nothing to process when the path pattern is missing', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
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
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

    // Verify we got them all
    expect(res.length).to.eql(0);
    done();
  });


  it('should find nothing to process when the domain is missing', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
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
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <path-pattern>[^ "]+</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

    // Verify we got them all
    expect(res.length).to.eql(0);
    done();
  });


  it('should find nothing to process when the search pattern is missing', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
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
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>[^ "]+</path-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

    // Verify we got them all
    expect(res.length).to.eql(0);
    done();
  });


  it('should find something to process', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t5.gif" />
      <br />
      <img src="http://google.com/images/view.php?img=http://titi.fr/gallery/view.php?img=t7.gif" class="g" />
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>[^ "]+</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

    // Verify we got them all
    expect(res.length).to.eql(3);

    expect(res[0].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t1.jpg');
    expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t5.gif');
    expect(res[1].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
    expect(res[2].extMethod).to.eql(ExtMethods.EXPREG.id);
    done();
  });


  it('should find something to process (even when there are unknown DL strategies)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t5.gif" />
      <br />
      <img src="http://google.com/images/view.php?img=http://titi.fr/gallery/view.php?img=t7.gif" class="g" />
      <br />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>[^ "]+</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
        <host id="toto">
          <domain>toto.fr</domain>
          <path-pattern>[^ "]+</path-pattern>
          <search-pattern>unknown-strategy</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

    // Verify we got them all
    expect(res.length).to.eql(3);

    expect(res[0].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t1.jpg');
    expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t5.gif');
    expect(res[1].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
    expect(res[2].extMethod).to.eql(ExtMethods.EXPREG.id);
    done();
  });


  it('should find something to process with an interceptor after path-pattern', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://titi.fr/gallery/something1_tn.jpg" class="paf" />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <img src="http://titi.fr/gallery/somethi_tn_ng2_tn.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>[^ "]+\\.jpg</path-pattern>
          <interceptor>replace: '_tn\\.', '.'</interceptor>
          <search-pattern>self</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);

    // Verify we got them all
    expect(res.length).to.eql(4);

    expect(res[0].matchingUrl).to.eql('http://titi.fr/gallery/t1.jpg');
    expect(res[0].extMethod).to.eql(ExtMethods.SELF.id);

    expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/something1.jpg');
    expect(res[1].extMethod).to.eql(ExtMethods.SELF.id);

    expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
    expect(res[2].extMethod).to.eql(ExtMethods.SELF.id);

    expect(res[3].matchingUrl).to.eql('http://titi.fr/gallery/somethi_tn_ng2.jpg');
    expect(res[3].extMethod).to.eql(ExtMethods.SELF.id);
    done();
  });


  it('should create new processors correctly', function(done) {

    var np = newProcessor('the url', 'page title', 'the search pattern', 'originUrl');
    expect(np.matchingUrl).to.eql('the url');
    expect(np.originUrl).to.eql('originUrl');
    expect(np.pageTitle).to.eql('page title');
    expect(np.searchPattern).to.eql('the search pattern');
    expect(np.extMethod).to.eql(0);
    expect(np.status).to.eql(ProcessorStatus.WAITING);
    expect(np.downloadLinks).to.eql([]);
    expect(!! np.id).to.be(true);
    expect(np.interceptors).to.eql([]);

    np = newProcessor('the url', 'page title', 'Self', 'origin Url', [{replace: 'ok', by: 'that'}]);
    expect(np.matchingUrl).to.eql('the url');
    expect(np.originUrl).to.eql('origin Url');
    expect(np.pageTitle).to.eql('page title');
    expect(np.searchPattern).to.eql('Self');
    expect(np.extMethod).to.eql(ExtMethods.SELF.id);
    expect(np.status).to.eql(ProcessorStatus.WAITING);
    expect(np.downloadLinks).to.eql([]);
    expect(!! np.id).to.be(true);
    expect(np.interceptors.length).to.eql(1);
    expect(np.interceptors[0]).to.eql({replace: 'ok', by: 'that'});

    done();
  });


  it('should make sure extraction method IDs are unique', function(done) {

    var set = new Set();
    for (var key in ExtMethods) {
      set.add(ExtMethods[key].id);
    }

    expect(set.size).to.eql(Object.keys(ExtMethods).length);
    done();
  });


  it('should make sure processor status IDs are unique', function(done) {

    var set = new Set();
    for (var key in ProcessorStatus) {
      set.add(ProcessorStatus[key]);
    }

    expect(set.size).to.eql(Object.keys(ProcessorStatus).length);
    done();
  });


  it('should make sure download status IDs are unique', function(done) {

    var set = new Set();
    for (var key in DlStatus) {
      set.add(DlStatus[key]);
    }

    expect(set.size).to.eql(Object.keys(DlStatus).length);
    done();
  });


  it('should make sure processor can be reset', function(done) {

    var p = {
      status: ProcessorStatus.RETRIEVING_LINKS_FAILURE,
      downloadLinks: [{}, {}]
    };

    expect(p.downloadLinks.length).to.eql(2);
    resetProcessor(p);
    expect(p.downloadLinks.length).to.eql(0);
    expect(p.status).to.eql(ProcessorStatus.WAITING);
    done();
  });


  it('should handle processors correctly (SELF)', function(done) {

    var p = newProcessor('http://tutu.com/some-image.jpg', 'page title', 'self', 'origin url');
    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      self: function(url) {
        this.invoked = true;
        expect(url).to.eql('http://tutu.com/some-image.jpg');
        return [url];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    expect(extractor.invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);
    expect(p.downloadLinks[0].link).to.eql('http://tutu.com/some-image.jpg');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    expect(queue.modified).to.eql(false);
    done();
  });


  it('should handle processors correctly (REPLACE)', function(done) {

    var p = newProcessor('http://tutu.com/some-page.html', 'page title', 'replace: \'html\', \'jpg\'', 'origin url');
    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      replace: function(url, xmlSearchPattern) {
        this.invoked = true;
        expect(url).to.eql('http://tutu.com/some-page.html');
        return ['http://tutu.com/some-page.jpg'];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    expect(extractor.invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);
    expect(p.downloadLinks[0].link).to.eql('http://tutu.com/some-page.jpg');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    expect(queue.modified).to.eql(false);
    done();
  });


  it('should handle processors correctly (SELF with interceptor)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://titi.fr/gallery/something1_tn.jpg" class="paf" />
      <img src="http://titi.fr/gallery/view.php?img=t4.jpg" class="paf" />
      <img src="http://titi.fr/gallery/somethi_tn_ng2_tn.jpg" class="paf" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>[^ "]+\\.jpg</path-pattern>
          <search-pattern>self</search-pattern>
          <interceptor>replace: '(_tn)?\\.jpg', '_1200.png'</interceptor>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);
    expect(processors.length).to.eql(4);
    expect(processors[ 0 ].pageTitle).to.eql('');

    var idleFn = function() {};
    var extractorFn = extractor();
    var queue = {
      processNextItem: function() {}
    };

    var foundLinks = [];
    processors.forEach( function(processor) {
      handleProcessor(processor, extractorFn, queue, idleFn, idleFn, newAlreadyVisitedUrls());
      processor.downloadLinks.forEach( function(link) {
        foundLinks.push(link);
      });
    });

    expect(foundLinks[0].link).to.eql('http://titi.fr/gallery/t1_1200.png');
    expect(foundLinks[1].link).to.eql('http://titi.fr/gallery/something1_1200.png');
    expect(foundLinks[2].link).to.eql('http://titi.fr/gallery/view.php?img=t4_1200.png');
    expect(foundLinks[3].link).to.eql('http://titi.fr/gallery/somethi_tn_ng2_1200.png');
    done();
  });


  it('should handle processors correctly (SELF with interceptor - bug 49)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://something.org/t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://something.org/album1/fotos/sub/tn_es1.jpg" />
      <img src="https://something.org/album2/fotos41/es2.jpg" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://something.org/album51/fotos98/tn_s51.jpg" />
      <img src="https://something.org/album3/fotos41/edfs2.jpg" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.bug-49.xml');
    return dictionaryP.then( function(dictionary) {

      // Parse the dictionary
      var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

      // Extract links
      var processors = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', [dictionaryWrapper]);
      var idleFn = function() {};
      var extractorFn = extractor();
      var queue = {
        processNextItem: function() {}
      };

      var dlLinks = [];
      processors.forEach(function(p) {
        handleProcessor(p, extractorFn, queue, idleFn, idleFn, newAlreadyVisitedUrls());
        p.downloadLinks.forEach(function(dlLink) {
          dlLinks.push(dlLink.link);
        });
      });

      // Verify we got them all
      expect(dlLinks.length).to.eql(4);
      expect(dlLinks[0]).to.eql('http://something.org/album1/fotos/sub/es1.jpg');
      expect(dlLinks[1]).to.eql('https://something.org/album2/fotos41/es2.jpg');
      expect(dlLinks[2]).to.eql('http://something.org/album51/fotos98/s51.jpg');
      expect(dlLinks[3]).to.eql('https://something.org/album3/fotos41/edfs2.jpg');
    });
  });


  it('should handle processors correctly on the current page (NOT the right URL)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://host44.fr/gallery/t1.jpg" class="img" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://host44.fr/gallery/t2.jpg" class="img" />
      <img src="http://host44.fr/gallery/t1.jpg" class="img" />
      <img src="http://host44.fr/gallery/dir/t45.jpg" class="img" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" class="img" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="host44">
          <domain>host44.fr</domain>
          <path-pattern>_$CURRENT$_</path-pattern>
          <search-pattern>CLASS: img</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionaryWrapper);
    expect(processors.length).to.eql(0);
    done();
  });


  it('should handle processors correctly on the current page (WITH the right URL)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html>
      <head>
        <title>That's a serious thing</title>
      </head>
      <body>
      <img src="http://host44.fr/gallery/t1.jpg" class="img" />
      <br />
      <img src="http://mimi.net/gallery/t2.jpg" />
      <br />
      <img src="http://host44.fr/gallery/t2.jpg" class="img" />
      <img src="https://host44.fr/gallery/t1.jpg" class="img" />
      <img src="http://www.host44.fr/gallery/dir/t45.jpg" class="img" />
      <br />
      <img src="http://bibi.com/path/to/this/image1.PNG" />
      <img src="http://bibi.com/path/to/this/image2.svg" class="img" />
      <br />
      <!-- duplicate -->
      <img src="https://host44.fr/gallery/t1.jpg" class="img" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="host44">
          <domain>host44.fr</domain>
          <path-pattern>_$CURRENT$_</path-pattern>
          <search-pattern>CLASS: img</search-pattern>
        </host>
    `;

    // Parse the dictionary
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'https://host44.fr/here/it/is.php', dictionaryWrapper);
    expect(processors.length).to.eql(1);

    var idleFn = function() {};
    var extractorFn = extractor();
    var queue = {
      processNextItem: function() {}
    };

    var p = processors[0];
    handleProcessor(p, extractorFn, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    expect(p.pageTitle).to.eql('That\'s a serious thing');
    expect(p.downloadLinks.length).to.eql(5);
    expect(p.downloadLinks[0].link).to.eql('http://host44.fr/gallery/t1.jpg');
    expect(p.downloadLinks[1].link).to.eql('http://host44.fr/gallery/t2.jpg');
    expect(p.downloadLinks[2].link).to.eql('https://host44.fr/gallery/t1.jpg');
    expect(p.downloadLinks[3].link).to.eql('http://www.host44.fr/gallery/dir/t45.jpg');

    // Yes, this one is expected too. The "class" attribute makes no difference.
    expect(p.downloadLinks[4].link).to.eql('http://bibi.com/path/to/this/image2.svg');
    done();
  });


  it('should handle direct images correctly', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html>
      <head>
        <title>That's a serious thing!</title>
      </head>
      <body>
        <a onclick="f(x)" href="http://host44.fr/gallery/t1_big.jpg" class="pom">
          <img src="http://host44.fr/gallery/t1.jpg" class="img" />
        </a>
        <br />
        <a href="http://host44.fr/gallery/m1_big.png">
          <img src="http://host44.fr/gallery/m1.jpg" />
        </a>
        <img src="http://mimi.net/gallery/t2.jpg" />
        <br />
        <img src="http://host44.fr/gallery/t2.jpg" class="img" />
        <img src="https://host44.fr/gallery/t1.jpg" class="img" />
        <img src="http://www.host44.fr/gallery/dir/t45.jpg" class="img" />
        <br />
        <img src="http://bibi.com/path/to/this/image1.PNG" />

        <a href="http://host44.fr/gallery/path/msqd_big.jpg?t=opfdglm">
          <img src="http://host44.fr/gallery/msqd.jpg" />
        </a>
        <a href="http://host_not_the_same.fr/gallery/path/msqb_big_800x600.jpg">
          <img src="http://host44.fr/gallery/msqb.jpg" />
        </a>
    </body></html>
    `;

    // Parse the dictionary
    var dictionaryWrapper = buildDictionaryWrapperForDirectImages();

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'https://host44.fr/here/it/is.php', dictionaryWrapper);
    expect(processors.length).to.eql(1);

    var idleFn = function() {};
    var extractorFn = extractor();
    var queue = {
      processNextItem: function() {}
    };

    var p = processors[0];
    handleProcessor(p, extractorFn, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    expect(p.pageTitle).to.eql('That\'s a serious thing!');
    expect(p.downloadLinks.length).to.eql(4);
    expect(p.downloadLinks[0].link).to.eql('http://host44.fr/gallery/t1_big.jpg');
    expect(p.downloadLinks[1].link).to.eql('http://host44.fr/gallery/m1_big.png');
    expect(p.downloadLinks[2].link).to.eql('http://host44.fr/gallery/path/msqd_big.jpg');
    expect(p.downloadLinks[3].link).to.eql('http://host_not_the_same.fr/gallery/path/msqb_big.jpg');
    done();
  });


  /**
   * A utility promise that waits for a given time.
   * @param {integer} ms The number of milliseconds to wait.
   * @return {Promise} A promise.
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (CLASS)', function() {

    var p = newProcessor('test', 'page title2', 'class: toto', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        return ['http://toto.fr/test1', 'test2'];
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
      expect(p.downloadLinks.length).to.eql(2);

      expect(p.downloadLinks[0].link).to.eql('http://toto.fr/test1');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);

      expect(p.downloadLinks[1].link).to.eql('http://localhost:9876/base/tests/resources/test2');
      expect(p.downloadLinks[1].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (CLASS with unreachable remote page)', function() {

    var p = newProcessor('test', 'page title2', 'class: toto', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/it.does.not.exist.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        return [];
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(false);
      expect(queue.modified).to.eql(true);
      expect(p.status).to.eql(ProcessorStatus.RETRIEVING_LINKS_FAILURE);
      expect(p.downloadLinks.length).to.eql(0);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (CLASS with no found link)', function() {

    var p = newProcessor('test', 'page title2', 'class: toto', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: true,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        return [];
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(queue.modified).to.eql(true);
      expect(p.status).to.eql(ProcessorStatus.NO_LINK_FOUND);
      expect(p.downloadLinks.length).to.eql(0);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (ID)', function() {

    var p = newProcessor('test', 'page title2', 'id: toto', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        return ['https://toto.net/v/test3'];
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.downloadLinks.length).to.eql(1);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);

      expect(p.downloadLinks[0].link).to.eql('https://toto.net/v/test3');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (XPATH with cache for visited URLs)', function() {

    var p = newProcessor('test', 'page title2', 'xpath: //test', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        // Put some duplicate here => unified in the resulting array
        return ['test1', 'test2'];
      }
    };

    // Add an already visited URL
    var alreadyVisitedUrls = newAlreadyVisitedUrls();
    alreadyVisitedUrls.list.push('http://localhost:9876/base/tests/resources/test2');

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, alreadyVisitedUrls);

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
      expect(p.downloadLinks.length).to.eql(2);

      expect(p.downloadLinks[0].link).to.eql('http://localhost:9876/base/tests/resources/test1');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
      expect(p.downloadLinks[1].link).to.eql('http://localhost:9876/base/tests/resources/test2');
      expect(p.downloadLinks[1].status).to.eql(DlStatus.ALREADY_DOWNLOADED);
      expect(queue.modified).to.eql(false);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (XPATH with duplicate)', function() {

    var p = newProcessor('test', 'page title2', 'xpath: //test', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        // Put some duplicate here => unified in the resulting array
        return ['test1', 'test1'];
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
      expect(p.downloadLinks.length).to.eql(1);

      expect(p.downloadLinks[0].link).to.eql('http://localhost:9876/base/tests/resources/test1');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (XPATH and no cache for visited URLs)', function() {

    var p = newProcessor('test', 'page title2', 'xpath: //test', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      xpath: function(doc, xpathExpr) {
        this.invoked = true;
        // Put some duplicate here => unified in the resulting array
        return ['test1', 'test2'];
      }
    };

    var cache = newAlreadyVisitedUrls();
    cache.enabled = false;
    cache.list.push('http://localhost:9876/base/tests/resources/test2');

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, cache);

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
      expect(p.downloadLinks.length).to.eql(2);

      expect(p.downloadLinks[0].link).to.eql('http://localhost:9876/base/tests/resources/test1');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
      expect(p.downloadLinks[1].link).to.eql('http://localhost:9876/base/tests/resources/test2');
      expect(p.downloadLinks[1].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should handle processors correctly (CSS Query and no cache for visited URLs)', function() {

    var p = newProcessor('test', 'page title2', 'css query: div.ct &gt; img', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      cssQuery: function(doc, query, property) {
        this.invoked = true;
        // Put some duplicate here => unified in the resulting array
        return ['test1', 'test2'];
      }
    };

    var cache = newAlreadyVisitedUrls();
    cache.enabled = false;
    cache.list.push('http://localhost:9876/base/tests/resources/test2');

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, cache);

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
      expect(p.downloadLinks.length).to.eql(2);

      expect(p.downloadLinks[0].link).to.eql('http://localhost:9876/base/tests/resources/test1');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
      expect(p.downloadLinks[1].link).to.eql('http://localhost:9876/base/tests/resources/test2');
      expect(p.downloadLinks[1].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  it('should handle processors correctly (EXPREG)', function() {

    var p = newProcessor('test', 'page title2', 'expreg: src="([^)]+)"', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    var extractor = {
      invoked: false,
      expreg: function(doc, xpathExpr) {
        this.invoked = true;
        return ['test1'];
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(extractor.invoked).to.be(true);
      expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
      expect(p.downloadLinks.length).to.eql(1);

      expect(p.downloadLinks[0].link).to.eql('http://localhost:9876/base/tests/resources/test1');
      expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  it('should handle processors correctly (remote document is not a valid one)', function() {

    var p = newProcessor('test', 'page title2', 'xpath: //test', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/simple.txt';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor(), queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(p.status).to.eql(ProcessorStatus.RETRIEVING_LINKS_FAILURE);
      expect(p.downloadLinks.length).to.eql(0);
      expect(queue.modified).to.eql(true);
    });
  });


  it('should handle processors correctly (invalid strategy)', function() {

    var p = newProcessor('test', 'page title2', 'this is invalid', 'origin url');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/empty.html';

    var idleFn = function() {};
    var queue = {
      modified: false,
      processNextItem: function() {
        this.modified = true;
      }
    };

    // Execute the test
    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor(), queue, idleFn, idleFn, newAlreadyVisitedUrls());

    // In this case, processing is asynchronous.
    return sleep(1000).then(function() {
      expect(p.status).to.eql(ProcessorStatus.NO_LINK_FOUND);
      expect(p.downloadLinks.length).to.eql(0);
      expect(queue.modified).to.eql(true);
    });
  });
});
