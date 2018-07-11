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

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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
      var res = findWhatToProcess(null, 'http://titi.fr/page.html', dictionary);
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
      <img src="http://bibi.com/path/to/this/image3.jpg" />
      <img src="http://bibi.com/path/to/this/image2.svg" />
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://titi.fr/some-folder/at-second-level/some-web-page.html', dictionary);

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
    </body></html>
    `;

    // Test resources are served by Karma
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://sub-p1.titi.fr/some-folder/at-second-level/some-web-page.html', dictionary);

      // Verify we got them all
      expect(res.length).to.eql(10);

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

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', [dictionary]);

      // Verify we got them all
      expect(res.length).to.eql(1);

      expect(res[0].matchingUrl).to.eql('http://mimi.net/test/photos/view?t2.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);
      expect(res[0].searchPattern).to.eql('expreg: ">\\s*<a href="([^"]+)">');
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

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

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

    var np = newProcessor('the url', 'the search pattern');
    expect(np.matchingUrl).to.eql('the url');
    expect(np.searchPattern).to.eql('the search pattern');
    expect(np.extMethod).to.eql(0);
    expect(np.status).to.eql(ProcessorStatus.WAITING);
    expect(np.downloadLinks).to.eql([]);
    expect(!! np.id).to.be(true);
    expect(np.interceptors).to.eql([]);

    np = newProcessor('the url', 'Self', [{replace: 'ok', by: 'that'}]);
    expect(np.matchingUrl).to.eql('the url');
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

    var p = newProcessor('http://tutu.com/some-image.jpg', 'self');
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

    var p = newProcessor('http://tutu.com/some-page.html', 'replace: \'html\', \'jpg\'');
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

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);
    expect(processors.length).to.eql(4);

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

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);
    expect(processors.length).to.eql(0);
    done();
  });


  it('should handle processors correctly on the current page (WITH the right URL)', function(done) {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
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

    // Extract links
    var processors = findWhatToProcess(sourceDocument, 'https://host44.fr/here/it/is.php', dictionary);
    expect(processors.length).to.eql(1);

    var idleFn = function() {};
    var extractorFn = extractor();
    var queue = {
      processNextItem: function() {}
    };

    var p = processors[0];
    handleProcessor(p, extractorFn, queue, idleFn, idleFn, newAlreadyVisitedUrls());

    expect(p.downloadLinks.length).to.eql(5);
    expect(p.downloadLinks[0].link).to.eql('http://host44.fr/gallery/t1.jpg');
    expect(p.downloadLinks[1].link).to.eql('http://host44.fr/gallery/t2.jpg');
    expect(p.downloadLinks[2].link).to.eql('https://host44.fr/gallery/t1.jpg');
    expect(p.downloadLinks[3].link).to.eql('http://www.host44.fr/gallery/dir/t45.jpg');

    // Yes, this one is expected too. The "class" attribute makes no difference.
    expect(p.downloadLinks[4].link).to.eql('http://bibi.com/path/to/this/image2.svg');
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

    var p = newProcessor('test', 'class: toto');
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

    var p = newProcessor('test', 'class: toto');
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

    var p = newProcessor('test', 'class: toto');
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

    var p = newProcessor('test', 'id: toto');
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

    var p = newProcessor('test', 'xpath: //test');
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

    var p = newProcessor('test', 'xpath: //test');
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

    var cache = newAlreadyVisitedUrls();
    cache.enabled = false;

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
      expect(p.downloadLinks[1].link).to.eql('http://localhost:9876/base/tests/resources/test1');
      expect(p.downloadLinks[1].status).to.eql(DlStatus.WAITING);
      expect(queue.modified).to.eql(false);
    });
  });


  it('should handle processors correctly (EXPREG)', function() {

    var p = newProcessor('test', 'expreg: src="([^)]+)"');
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


  it('should handle processors correctly (invalid strategy)', function() {

    var p = newProcessor('test', 'this is invalid');
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
