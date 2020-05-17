'use strict';

describe('i18n', function() {

  /**
   * Verifies two objects have the exact same properties.
   * @param {object} obj1 The first object.
   * @param {object} obj2 The second object.
   * @return {boolean} True if the objects have the same properties, false otherwise.
   */
  function compareObjectProperties(obj1, obj2) {

    var keysObj1 = Object.keys(obj1);
    var keysObj2 = Object.keys(obj2);
    var keysOnlyInObj1 = keysObj1.filter( function(key) {
      return keysObj2.indexOf(key) === -1;
    });

    var keysOnlyInObj2 = keysObj2.filter( function(key) {
      return keysObj1.indexOf(key) === -1;
    });

    if (keysOnlyInObj1.length > 0) {
      console.log('Keys found only in the first element:');
      console.log(keysOnlyInObj1);
    }

    if (keysOnlyInObj2.length > 0) {
      console.log('Keys found only in the second element:');
      console.log(keysOnlyInObj2);
    }

    return keysOnlyInObj1.length === 0 && keysOnlyInObj2.length === 0;
  };


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should verify FR and EN have the same keys', function() {

    return loadRemoteDocument('http://localhost:9876/base/_locales/en/messages.json', false).then( function(jsonAsText) {
      var en = JSON.parse(jsonAsText);
      return loadRemoteDocument('http://localhost:9876/base/_locales/fr/messages.json', false).then( function(jsonAsText) {
        var fr = JSON.parse(jsonAsText);
        var sameKeys = compareObjectProperties(en, fr);
        expect(sameKeys).to.eql(true);
      });
    });
  });


  // No "done "callback for this test.
  // Instead, we return a promise. If it fails, it will fail the test.
  it('should verify FR (and EN) have no "-" character in key names', function() {

    return loadRemoteDocument('http://localhost:9876/base/_locales/en/messages.json', false).then( function(jsonAsText) {
      var en = JSON.parse(jsonAsText);
      return loadRemoteDocument('http://localhost:9876/base/_locales/fr/messages.json', false).then( function(jsonAsText) {

        var fr = JSON.parse(jsonAsText);
        var keysObj1 = Object.keys(fr);
        var keysWithHyphen = keysObj1.filter( function(key) {
          return key.includes('-');
        }).map( function(key) {
          console.log('Found invalid key name: ' + key);
          return key;
        });

        expect(keysWithHyphen.length).to.eql(0);
      });
    });
  });
});
