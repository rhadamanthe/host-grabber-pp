// A simple script to run in Node.JS and that verifies
// we can run the "library.dictionary.js" script directly in Node.JS.
// This script is also reusable (use environment variables).

var path = process.env.RHAD_SCRIPT || '../../src/scripts/mixed/library.dictionary.js';
var dictPath = process.env.RHAD_DICTIONARY || '../resources/host.background.library.test.xml';

var fs = require('fs');
var lib = require(path)

fs.readFile(dictPath, 'utf8', function(err, data) {
  var DOMParser = require('xmldom').DOMParser;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(data, 'text/xml');

  var result = lib.parseAndVerifyDictionary(xmlDoc);
  result.errors.forEach( function(error) {
    console.log(error);
  });

  if (result.errors.length !== 0) {
    process.exit(1);
  } else {
    console.log('Validation succeeded.');
  }
});
