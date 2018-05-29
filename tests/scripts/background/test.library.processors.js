'use strict';

describe('background => library.processors', function() {


  it('should find what to process', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <img src="http://titi.fr/gallery/view.php?img=t2.jpg" class="paf" />
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
    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/host.background.library.test.xml');
    return dictionaryP.then( function(dictionary) {

      // Extract links
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

      // Verify we got them all
      expect(res.length).to.eql(6);

      expect(res[0].matchingUrl).to.eql('http://mimi.de/gallery/t2.jpg');
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


  it('should find what to process (with CDATA)', function() {

    var sourceDocument = document.implementation.createHTMLDocument('');
    sourceDocument.documentElement.innerHTML = `<html><body>
      <img src="http://titi.fr/gallery/view.php?img=t1.jpg" class="paf" />
      <br />
      <img src="http://mimi.com/test/photos/view?t2.jpg" />
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
      var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

      // Verify we got them all
      expect(res.length).to.eql(1);

      expect(res[0].matchingUrl).to.eql('http://mimi.com/test/photos/view?t2.jpg');
      expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);
      expect(res[0].searchPattern).to.eql('expreg: ">\\s*<a href="([^"]+)">');
    });
  });


  it('should find nothing to process when the URL pattern is missing', function(done) {

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
    var dictionary = document.implementation.createDocument('', 'root');
    dictionary.documentElement.innerHTML = `<root>
        <host id="titi">
          <searchpattern>expreg: src="(.*\.jpg)"</searchpattern>
        </host>
      </root>
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
    var dictionary = document.implementation.createDocument('', 'root');
    dictionary.documentElement.innerHTML = `<root>
        <host id="titi">
          <urlpattern>^http://(www\.)?titi\.fr/[^ "]+</urlpattern>
        </host>
      </root>
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
      <img src="http://mimi.de/gallery/t2.jpg" />
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
    dictionary.documentElement.innerHTML = `<root>
        <host id="titi">
          <urlpattern>^http://(www\.)?titi\.fr/[^ "]+</urlpattern>
          <searchpattern>expreg: src="(.*\.jpg)"</searchpattern>
        </host>
      </root>
    `;

    // Extract links
    var res = findWhatToProcess(sourceDocument, 'http://web.page.url.com/we/do/not/care/here', dictionary);

    // Verify we got them all
    expect(res.length).to.eql(4);

    expect(res[0].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t1.jpg');
    expect(res[0].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[1].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t5.gif');
    expect(res[1].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[2].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t7.gif');
    expect(res[2].extMethod).to.eql(ExtMethods.EXPREG.id);

    expect(res[3].matchingUrl).to.eql('http://titi.fr/gallery/view.php?img=t4.jpg');
    expect(res[3].extMethod).to.eql(ExtMethods.EXPREG.id);
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

    np = newProcessor('the url', 'Self');
    expect(np.matchingUrl).to.eql('the url');
    expect(np.searchPattern).to.eql('Self');
    expect(np.extMethod).to.eql(ExtMethods.SELF.id);
    expect(np.status).to.eql(ProcessorStatus.WAITING);
    expect(np.downloadLinks).to.eql([]);
    expect(!! np.id).to.be(true);

    done();
  });


  it('should find the extraction method correctly', function(done) {

    expect(findExtractionMethod('self')).to.eql(ExtMethods.SELF.id);
    expect(findExtractionMethod(' Self ')).to.eql(ExtMethods.SELF.id);

    expect(findExtractionMethod('replace: \'view\.php\?img=\', \'images/\'')).to.eql(ExtMethods.REPLACE.id);
    expect(findExtractionMethod(' REPlace : \'view\.php\?img=\', \'images/\' ')).to.eql(ExtMethods.REPLACE.id);

    expect(findExtractionMethod('ID: toto')).to.eql(ExtMethods.ID.id);
    expect(findExtractionMethod(' id : toto ')).to.eql(ExtMethods.ID.id);

    expect(findExtractionMethod('Class: toto')).to.eql(ExtMethods.CLASS.id);
    expect(findExtractionMethod(' class : toto ')).to.eql(ExtMethods.CLASS.id);

    expect(findExtractionMethod('XPath: //*[class=\'toto\']')).to.eql(ExtMethods.XPATH.id);
    expect(findExtractionMethod(' xpath : //*[class=\'toto\'] ')).to.eql(ExtMethods.XPATH.id);

    expect(findExtractionMethod('expReg: (http://mimi\.[^"]*\.(jpg|gif|png))')).to.eql(ExtMethods.EXPREG.id);
    expect(findExtractionMethod(' expreg : (http://mimi\.[^"]*\.(jpg|gif|png)) ')).to.eql(ExtMethods.EXPREG.id);
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


  it('should handle processors correctly (SELF)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'self');
    var extractor = {
      self: function(url) {
        invoked = true;
        expect(url).to.eql('test');
        return [url];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);
    expect(p.downloadLinks[0].link).to.eql('test');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    done();
  });


  it('should handle processors correctly (REPLACE)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'replace: \'.*\', \'\'');
    var extractor = {
      replace: function(url, xmlSearchPattern) {
        invoked = true;
        expect(url).to.eql('test');
        return [url];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);
    expect(p.downloadLinks[0].link).to.eql('test');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    done();
  });


  it('should handle processors correctly (CLASS)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'class: toto');
    p.xmlDoc = document.implementation.createHTMLDocument('');
    p.status = ProcessorStatus.RETRIEVING_LINKS_DONE;

    var extractor = {
      xpath: function(doc, xpathExpr) {
        invoked = true;
        return ['test1', 'test2'];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(2);

    expect(p.downloadLinks[0].link).to.eql('test1');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);

    expect(p.downloadLinks[1].link).to.eql('test2');
    expect(p.downloadLinks[1].status).to.eql(DlStatus.WAITING);
    done();
  });


  it('should handle processors correctly (CLASS with links not retrieved)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'class: toto');
    p.xmlDoc = document.implementation.createHTMLDocument('');
    p.status = ProcessorStatus.RETRIEVING_LINKS_FAILURE;

    var extractor = {
      xpath: function(doc, xpathExpr) {
        invoked = true;
        return [];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(0);
    done();
  });


  it('should handle processors correctly (ID)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'id: toto');
    p.xmlDoc = document.implementation.createHTMLDocument('');
    p.status = ProcessorStatus.RETRIEVING_LINKS_DONE;

    var extractor = {
      xpath: function(doc, xpathExpr) {
        invoked = true;
        return ['test1'];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);

    expect(p.downloadLinks[0].link).to.eql('test1');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    done();
  });


  it('should handle processors correctly (XPATH)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'xpath: //test');
    p.xmlDoc = document.implementation.createHTMLDocument('');
    p.status = ProcessorStatus.RETRIEVING_LINKS_DONE;

    var extractor = {
      xpath: function(doc, xpathExpr) {
        invoked = true;
        return ['test1'];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);

    expect(p.downloadLinks[0].link).to.eql('test1');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    done();
  });


  it('should handle processors correctly (EXPREG)', function(done) {

    var invoked = false;
    var p = newProcessor('test', 'expreg: src="([^)]+)"');
    p.xmlDoc = document.implementation.createHTMLDocument('');
    p.status = ProcessorStatus.RETRIEVING_LINKS_DONE;

    var extractor = {
      expreg: function(doc, xpathExpr) {
        invoked = true;
        return ['test1'];
      }
    };

    expect(p.downloadLinks.length).to.eql(0);
    handleProcessor(p, extractor);

    expect(invoked).to.be(true);
    expect(p.status).to.eql(ProcessorStatus.GOT_LINKS);
    expect(p.downloadLinks.length).to.eql(1);

    expect(p.downloadLinks[0].link).to.eql('test1');
    expect(p.downloadLinks[0].status).to.eql(DlStatus.WAITING);
    done();
  });


  it('should handle processors correctly (need to download a remote document successfully)', function(done) {

    var p = newProcessor('test', 'id: toto');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/host.background.library.test.xml';

    expect(!! p.xmlDoc).to.be(false);
    handleProcessor(p, extractor);

    setTimeout(function() {
      checkCompletion(p, done, ProcessorStatus.RETRIEVING_LINKS_DONE);
    }, 1000);
  });


  it('should handle processors correctly (need to download a remote document UNsuccessfully)', function(done) {

    var p = newProcessor('test', 'id: toto');
    p.matchingUrl = 'http://localhost:9876/base/tests/resources/not.found.xml';

    expect(!! p.xmlDoc).to.be(false);
    handleProcessor(p, extractor);

    setTimeout(function() {
      checkCompletion(p, done, ProcessorStatus.RETRIEVING_LINKS_FAILURE);
    }, 1000);
  });


  /**
   * Verifies the completion of processor handling when a document must be downloaded.
   * @param {object} p A processor.
   * @param {function} done The function to invoke when this one completes.
   * @param {integer} expectedStatus The expected status (see ProcessorStatus constants).
   * @returns {undefined}
   */
  function checkCompletion(p, done, expectedStatus) {

    // The processor's status was updated
    expect(p.status).to.eql(expectedStatus);

    // There is a document if it could be downloaded successfully
    expect(!! p.xmlDoc).to.be(expectedStatus === ProcessorStatus.RETRIEVING_LINKS_DONE);
    done();
  }
});
