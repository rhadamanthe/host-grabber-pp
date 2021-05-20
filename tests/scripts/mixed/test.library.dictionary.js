'use strict';

describe('background => library.dictionary', function() {

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


  /**
   * Verifies a dictionary.
   * @param {string} fileName The name of the file that contains the dictionary.
   * @param {function} done The done function.
   * @return {undefined}
   */
  function verifyDictionary(fileName) {

    var dictionaryP = loadRemoteDocument('http://localhost:9876/base/tests/resources/' + fileName);
    return dictionaryP.then( function(dictionary) {
      var validationResult = parseAndVerifyDictionary(dictionary);
      if (validationResult.errors.length !== 0) {
        var message = 'Errors were found in dictionary: ' + fileName + '\n';
        validationResult.errors.forEach(function(error) {
          message += error + '\n';
        });

        expect().fail(message);
      }
    });
  }


  it('should remove CDATA mark-ups', function(done) {

    expect(removeCDataMarkups('this is a some content')).to.eql('this is a some content');
    expect(removeCDataMarkups('<![cdata[this is a some content')).to.eql('this is a some content');
    expect(removeCDataMarkups('<![cdata[this is a some content]]>')).to.eql('this is a some content');
    expect(removeCDataMarkups('this is a some content]]>')).to.eql('this is a some content');
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

    expect(findExtractionMethod('CSS query: div.col-md-12 img')).to.eql(ExtMethods.CSS_QUERY.id);
    expect(findExtractionMethod(' css query : div.col-md-12 img')).to.eql(ExtMethods.CSS_QUERY.id);

    expect(findExtractionMethod('invalid')).to.eql(0);
    expect(findExtractionMethod(null)).to.eql(0);
    expect(findExtractionMethod(undefined)).to.eql(0);
    for (var ext in ExtMethods) {
      expect(ext.id).to.not.eql(0);
    };

    done();
  });


  it('should validate this basic dictionary item', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should validate a dictionary item with the current page', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="test">
          <domain>toto.fr</domain>
          <path-pattern>_$CURRENT$_</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('toto.fr');
    expect(obj.items[0].pathPattern).to.eql(globalCurrent);
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should validate a dictionary item with a domain pattern', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="test">
          <domain-pattern>.*</domain-pattern>
          <path-pattern>.+\\.jpg</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(String(obj.items[0].domain)).to.eql('/.*/');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should validate a dictionary item with the current domain', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="coppermine">
          <domain>_$ANY$_</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql(globalAny);
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    expect(obj.items[0].linkAttribute).to.eql(undefined);
    expect(obj.items[0].fileNameAttribute).to.eql(undefined);
    done();
  });


  it('should validate a dictionary item with the current domain and attributes (spec 1.0)', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="coppermine">
          <domain>_$ANY$_</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <search-pattern>css query: something img</search-pattern>
          <link-attribute>href</link-attribute>
          <file-name-attribute>alt</file-name-attribute>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql(globalAny);
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('css query: something img');
    expect(obj.items[0].errors.length).to.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    expect(obj.items[0].linkAttribute).to.eql('href');
    expect(obj.items[0].fileNameAttribute).to.eql('alt');
    done();
  });


  it('should validate a dictionary item with the current domain and attributes (spec 1.1)', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="coppermine">
          <domain>_$ANY$_</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <link-search-pattern>css query: something img</link-search-pattern>
          <link-attribute>href</link-attribute>
          <file-name-attribute>alt</file-name-attribute>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql(globalAny);
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('css query: something img');
    expect(obj.items[0].errors.length).to.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    expect(obj.items[0].linkAttribute).to.eql('href');
    expect(obj.items[0].fileNameAttribute).to.eql('alt');
    done();
  });


  it('should validate a dictionary item with 4 interceptors', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
          <interceptor>replace: 'p', 's'</interceptor>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
          <interceptor>replace: 's', 't'</interceptor>
          <interceptor>replace: 'q', 'a'</interceptor>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].linkAttribute).to.eql(undefined);
    expect(obj.items[0].fileNameAttribute).to.eql(undefined);
    expect(obj.items[0].errors.length).to.eql(0);

    expect(obj.items[0].interceptors1.length).to.eql(2);
    expect(obj.items[0].interceptors1[0]).to.eql({replace: 't', by: 'p', string: 'replace: \'t\', \'p\''});
    expect(obj.items[0].interceptors1[1]).to.eql({replace: 'p', by: 's', string: 'replace: \'p\', \'s\''});

    expect(obj.items[0].interceptors2.length).to.eql(2);
    expect(obj.items[0].interceptors2[0]).to.eql({replace: 's', by: 't', string: 'replace: \'s\', \'t\''});
    expect(obj.items[0].interceptors2[1]).to.eql({replace: 'q', by: 'a', string: 'replace: \'q\', \'a\''});
    done();
  });


  it('should validate a dictionary item with interceptors and attributes (DOM)', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
          <search-pattern>css query: test img</search-pattern>
          <link-attribute>href</link-attribute>
          <interceptor>replace: 's', 't'</interceptor>
          <file-name-attribute>title</file-name-attribute>
          <interceptor>replace: '-jpg', '.jpg'</interceptor>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('css query: test img');
    expect(obj.items[0].linkAttribute).to.eql('href');
    expect(obj.items[0].fileNameAttribute).to.eql('title');
    expect(obj.items[0].errors.length).to.eql(0);

    expect(obj.items[0].interceptors1.length).to.eql(1);
    expect(obj.items[0].interceptors1[0]).to.eql({replace: 't', by: 'p', string: 'replace: \'t\', \'p\''});

    expect(obj.items[0].interceptors2.length).to.eql(1);
    expect(obj.items[0].interceptors2[0]).to.eql({replace: 's', by: 't', string: 'replace: \'s\', \'t\''});

    expect(obj.items[0].interceptors3.length).to.eql(1);
    expect(obj.items[0].interceptors3[0]).to.eql({replace: '-jpg', by: '.jpg', string: 'replace: \'-jpg\', \'.jpg\''});
    done();
  });


  it('should validate a dictionary item with interceptors and attributes (text)', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
          <interceptor>replace: 's', 't'</interceptor>
          <file-name-attribute></file-name-attribute>
          <interceptor>replace: '-jpg', '.jpg'</interceptor>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].linkAttribute).to.eql(undefined);
    expect(obj.items[0].fileNameAttribute).to.eql('');
    expect(obj.items[0].errors.length).to.eql(0);

    expect(obj.items[0].interceptors1.length).to.eql(1);
    expect(obj.items[0].interceptors1[0]).to.eql({replace: 't', by: 'p', string: 'replace: \'t\', \'p\''});

    expect(obj.items[0].interceptors2.length).to.eql(1);
    expect(obj.items[0].interceptors2[0]).to.eql({replace: 's', by: 't', string: 'replace: \'s\', \'t\''});

    expect(obj.items[0].interceptors3.length).to.eql(1);
    expect(obj.items[0].interceptors3[0]).to.eql({replace: '-jpg', by: '.jpg', string: 'replace: \'-jpg\', \'.jpg\''});
    done();
  });


  it('should detect dictionary attributes with an incompatible strategy', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
          <link-attribute>href</link-attribute>
          <interceptor>replace: 's', 't'</interceptor>
          <file-name-attribute>title</file-name-attribute>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(2);
    expect(obj.errors[0]).to.eql('[titi] "link-attribute" mark-ups are only compatible with the "ID", "class", "XPath" and "CSS query" strategies.');
    expect(obj.errors[1]).to.eql('[titi] "file-name-attribute" mark-ups must be empty for the "self", "replace" and "expreg" strategies.');
    done();
  });


  it('should validate a dictionary item with 1 interceptor (config 1)', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);

    expect(obj.items[0].interceptors1.length).to.eql(1);
    expect(obj.items[0].interceptors1[0]).to.eql({replace: 't', by: 'p', string: 'replace: \'t\', \'p\''});
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should validate a dictionary item with 1 interceptor (config 2)', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);

    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(1);
    expect(obj.items[0].interceptors2[0]).to.eql({replace: 't', by: 'p', string: 'replace: \'t\', \'p\''});
    done();
  });


  it('should validate a dictionary item with 2 interceptors', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
        <host id="titi">
          <domain>titi.fr</domain>
          <path-pattern>.+\\.jpg</path-pattern>
          <interceptor>replace: 's', 'a'</interceptor>
          <search-pattern>expreg: src="(.*\\.jpg)"</search-pattern>
          <interceptor>replace: 't', 'p'</interceptor>
        </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(0);
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('expreg: src="(.*\\.jpg)"');
    expect(obj.items[0].errors.length).to.eql(0);

    expect(obj.items[0].interceptors1.length).to.eql(1);
    expect(obj.items[0].interceptors1[0]).to.eql({replace: 's', by: 'a', string: 'replace: \'s\', \'a\''});

    expect(obj.items[0].interceptors2.length).to.eql(1);
    expect(obj.items[0].interceptors2[0]).to.eql({replace: 't', by: 'p', string: 'replace: \'t\', \'p\''});
    done();
  });


  it('should detect an empty dictionary item', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = '<host id="titi"></host>';

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(3);
    expect(obj.items.length).to.eql(1);
    expect(obj.errors[0]).to.eql('[titi] A domain or a domain pattern was expected.');
    expect(obj.errors[1]).to.eql('[titi] A path-pattern was expected.');
    expect(obj.errors[2]).to.eql('[titi] A link-search-pattern was expected.');
    done();
  });


  it('should verify the domain pattern', function(done) {

    expect(''.match(globalDomainPattern)).to.eql(null);
    expect('ta'.match(globalDomainPattern).length).to.eql(1);
    expect('titi.fr'.match(globalDomainPattern).length).to.eql(1);
    expect('http://toto.fr'.match(globalDomainPattern)).to.eql(null);
    done();
  });


  it('should detect a dictionary with missing properties', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(3);
    expect(obj.items.length).to.eql(0);
    expect(obj.errors[0]).to.eql('The dictionary element must have a \'version\' attribute.');
    expect(obj.errors[1]).to.eql('The dictionary element must have a \'spec\' attribute.');
    expect(obj.errors[2]).to.eql('The dictionary element must have an \'ID\' attribute.');
    done();
  });


  it('should detect a dictionary item with an invalid domain', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>http://titi.fr</domain>
        <path-pattern>/.+\\.jpg$</path-pattern>
        <search-pattern>nawak</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors[0]).to.eql('[titi] Invalid domain: http://titi.fr');

    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql(undefined);
    expect(obj.items[0].pathPattern).to.eql(undefined);
    expect(obj.items[0].searchPattern).to.eql(undefined);
    expect(obj.items[0].errors.length).to.not.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item with invalid properties', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>titi.fr</domain>
        <path-pattern>/.+\\.jpg$</path-pattern>
        <interceptor>replace: 't',</interceptor>
        <search-pattern>nawak</search-pattern>
      </host>
      <host id="toto">
        <domain>toto.fr</domain>
        <path-pattern>^.+\\.jpg</path-pattern>
        <search-pattern>self</search-pattern>
        <interceptor>replace: 't', 's'</interceptor>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.not.eql(0);
    expect(obj.items[0].errors[0]).to.eql('A path pattern cannot start with \'/\'.');
    expect(obj.items[0].errors[1]).to.eql('A path pattern cannot end with \'$\'.');
    expect(obj.items[0].errors[2]).to.eql('An interceptor was found at an invalid position.');
    expect(obj.items[0].errors[3]).to.eql('Invalid interceptor: replace: \'t\',');
    expect(obj.items[0].errors[4]).to.eql('A search pattern was found at an invalid position.');
    expect(obj.items[0].errors[5]).to.eql('Invalid search pattern. Unrecognized strategy.');

    expect(obj.items[1].errors[0]).to.eql('A path pattern cannot start with \'^\'.');

    expect(obj.items.length).to.eql(2);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql(undefined);
    expect(obj.items[0].searchPattern).to.eql(undefined);
    expect(obj.items[0].errors.length).to.not.eql(0);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[1].interceptors2.length).to.eql(0);

    expect(obj.items[1].domain).to.eql('toto.fr');
    expect(obj.items[1].pathPattern).to.eql(undefined);
    expect(obj.items[1].searchPattern).to.eql(undefined);
    expect(obj.items[1].errors.length).to.not.eql(0);
    expect(obj.items[1].interceptors1.length).to.eql(0);
    expect(obj.items[1].interceptors2.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item without an ID', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host>
        <domain>titi.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>self</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('A host without an ID was found.');
    expect(obj.items.length).to.eql(0);
    done();
  });


  it('should detect a dictionary with duplicate IDs', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>titi.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>self</search-pattern>
      </host>
      <host id="titi">
        <domain>toto.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>self</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('A same ID is used by several hosts in the dictionary: titi');
    expect(obj.items.length).to.eql(1);
    done();
  });


  it('should detect a dictionary item with an unknown element', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <kikou></kikou>
        <domain>titi.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>self</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('[titi] An unknown tag was found: kikou');
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('self');
    expect(obj.items[0].errors.length).to.eql(1);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item with a domain at an invalid position', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <path-pattern>.+\\.jpg</path-pattern>
        <domain>titi.fr</domain>
        <search-pattern>self</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.not.eql(0);
    expect(obj.errors[0]).to.eql('[titi] A path pattern was found at an invalid position.');
    expect(obj.errors[1]).to.eql('[titi] A domain was found at an invalid position.');
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql(undefined);
    expect(obj.items[0].pathPattern).to.eql(undefined);
    expect(obj.items[0].searchPattern).to.eql(undefined);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item with a domain pattern at an invalid position', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <path-pattern>.+\\.jpg</path-pattern>
        <domain-pattern>titi\.fr</domain-pattern>
        <search-pattern>self</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.not.eql(0);
    expect(obj.errors[0]).to.eql('[titi] A path pattern was found at an invalid position.');
    expect(obj.errors[1]).to.eql('[titi] A domain pattern was found at an invalid position.');
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql(undefined);
    expect(obj.items[0].pathPattern).to.eql(undefined);
    expect(obj.items[0].searchPattern).to.eql(undefined);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item with a file name attribute at an invalid position', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>titi.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <file-name-attribute>alt</file-name-attribute>
        <search-pattern>self</search-pattern>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('[titi] A file name attribute was found at an invalid position.');
    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql('self');
    expect(obj.items[0].fileNameAttribute).to.eql(undefined);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item with a link attribute at an invalid position', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>titi.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <link-attribute>src</link-attribute>
        <search-pattern>id: toto</search-pattern>
        <file-name-attribute>alt</file-name-attribute>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('[titi] A link attribute mark-up was found at an invalid position.');

    dictionary.documentElement.innerHTML = `
      <host id="tutu">
        <domain>tutu.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>id: toto</search-pattern>
        <file-name-attribute>alt</file-name-attribute>
        <link-attribute>src</link-attribute>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('[tutu] A link attribute mark-up was found at an invalid position.');
    done();
  });


  it('should detect an unknown element in the dictionary', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <hoste id="titi">
        <path-pattern>.+\\.jpg</path-pattern>
        <domain>titi.fr</domain>
        <search-pattern>self</search-pattern>
      </hoste>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('An unknown tag was found in the dictionary: hoste');
    expect(obj.items.length).to.eql(0);
    done();
  });


  it('should detect a dictionary item with an interceptor at an invalid position', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>titi.fr</domain>
        <interceptor>replace: 'o', 'p'</interceptor>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>self</search-pattern>
        <interceptor>replace: 'o1', 'p2'</interceptor>
      </host>
  `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(1);
    expect(obj.errors[0]).to.eql('[titi] An interceptor was found at an invalid position.');
    expect(obj.items.length).to.eql(1);
    done();
  });


  it('should validate a dictionary item even when the DL strategy is unknown', function(done) {

    var dictionary = document.implementation.createDocument('', 'root');
    createAttribute(dictionary.documentElement, 'version', '1.0');
    createAttribute(dictionary.documentElement, 'spec', '1.0');
    createAttribute(dictionary.documentElement, 'id', 'id');
    dictionary.documentElement.innerHTML = `
      <host id="titi">
        <domain>titi.fr</domain>
        <path-pattern>.+\\.jpg</path-pattern>
        <search-pattern>nawak</search-pattern>
      </host>
    `;

    var obj = parseAndVerifyDictionary(dictionary);
    expect(obj.errors.length).to.eql(2);
    expect(obj.errors[0]).to.eql('[titi] Invalid search pattern. Unrecognized strategy.');
    expect(obj.errors[1]).to.eql('[titi] A link-search-pattern was expected.');

    expect(obj.items.length).to.eql(1);
    expect(obj.items[0].domain).to.eql('titi.fr');
    expect(obj.items[0].pathPattern).to.eql('.+\\.jpg');
    expect(obj.items[0].searchPattern).to.eql(undefined);
    expect(obj.items[0].interceptors1.length).to.eql(0);
    expect(obj.items[0].interceptors2.length).to.eql(0);
    done();
  });


  it('should validate test dictionaries - spec 1.0', function() {
    return verifyDictionary('host.background.library.test_spec_1.0.xml');
  });


  it('should validate test dictionaries - spec 1.1', function() {
    return verifyDictionary('host.background.library.test_spec_1.1.xml');
  });


  it('should validate test dictionaries - CData', function() {
    return verifyDictionary('host.background.library.test.cdata.xml');
  });


  it('should validate test dictionaries - domain pattern', function() {
    return verifyDictionary('host.background.library.test.domain-pattern.xml');
  });


  it('should validate test dictionaries - no domain', function() {
    return verifyDictionary('host.background.library.test.no-domain.xml');
  });


  it('should validate test dictionaries - bug 49', function() {
    return verifyDictionary('host.bug-49.xml');
  });


  it('should verify i18n for the dictionary', function(done) {
    var keys = Object.keys(i18nLocal);
    var invalidKeys = keys.filter( function(key) {
      typeof resolveI18n([key]) === 'string'

    }).map( function(key) {
      console.log('Invalid i18n key in the dictionary: ' + key);
      return key;
    });

    expect(invalidKeys.length).to.eql(0);
    done();
  });


  it('should verify resolveI18n works correctly', function(done) {
    var key = 'dictionary_err_8';
    var rawTranslation = resolveI18n([key]);
    expect(rawTranslation.includes(': {0}')).to.eql(true);

    var fullTranslation = resolveI18n([key, 'koko']);
    expect(fullTranslation.includes(': {0}')).to.eql(false);
    expect(fullTranslation.includes(': koko')).to.eql(true);
    done();
  });
});
