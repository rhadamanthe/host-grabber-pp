'use strict';


/**
 * No ID with 0 here!
 */
const ExtMethods = {
  ID:      { id: 1, pattern: /^\s*id\s*:\s*(.+)$/ig },
  CLASS:   { id: 2, pattern: /^\s*class\s*:\s*(.+)$/ig },
  XPATH:   { id: 3, pattern: /^\s*xpath\s*:\s*(.+)$/ig },
  REPLACE: { id: 4, pattern: /^\s*replace\s*:\s*\'(.+)\'\s*,\s*\'(.*)\'\s*$/ig },
  EXPREG:  { id: 5, pattern: /^\s*expreg\s*:\s*(.+)\s*$/ig },
  SELF:    { id: 6, pattern: /^\s*self\s*$/ig }
};


const ProcessorStatus = {
  WAITING: 1,
  RETRIEVING_LINKS: 2,
  GOT_LINKS: 3,
  DL_SUCCESS: 4,
  DL_FAILURE: 5,
  RETRIEVING_LINKS_FAILURE: 6,
  RETRIEVING_LINKS_DONE: 7
};

const DlStatus = {
  WAITING: 1,
  SUCCESS: 2,
  FAILURE: 3
};


/**
 * Finds what to process from the matches in the original web page, against dictionaries.
 * @param {object} sourceDocument The source page as a DOM document.
 * @param {string} url The URL of the current web page.
 * @param {object|array} dictionaries The DOM dictionary to use or an array of dictionaries.
 * @returns {Array} A non-null array of processors.
 */
function findWhatToProcess(sourceDocument, url, dictionaries) {

  // Prepare the result
  var processors = [];
  var alreadyVisistedUrls = [];

  // Fix the dictionaries parameter
  if (typeof dictionaries !== 'array') {
    dictionaries = [dictionaries];
  }

  // Iterate over the dictionaries
  for (var index = 0; index < dictionaries.length; index ++) {

    var dictionary = dictionaries[index];
    var tags = dictionary.documentElement.getElementsByTagName('host');
    for (var i = 0; i < tags.length; i++) {

      // Verify the dictionary item
      var urlpatterns = tags[i].getElementsByTagName('urlpattern');
      if(urlpatterns.length < 1 ) {
        console.log('Expected an URL pattern for ' + tags[i].id);
        continue;
      }

      var searchpatterns = tags[i].getElementsByTagName('searchpattern');
      if(searchpatterns.length < 1 ) {
        console.log('Expected a search pattern for ' + tags[i].id);
        continue;
      }

      // Find all the URLs that match the given pattern
      var fixedUrlPattern = fixUrlPattern(urlpatterns[0].innerHTML.trim());
      var regexp = new RegExp(fixedUrlPattern, 'ig');
      var source = sourceDocument.documentElement.innerHTML;
      var fixedSearchPattern = removeCDataMarkups(searchpatterns[0].innerHTML.trim());

      for (var match = regexp.exec(source); !! match; match = regexp.exec(source)) {
        var fixedLink = fixRelativeLinks(match[1], url);
        if (alreadyVisistedUrls.indexOf(fixedLink) !== -1 ) {
          continue;
        }

        alreadyVisistedUrls.push(fixedLink);
        processors.push( newProcessor(fixedLink, fixedSearchPattern));
      }
    }
  }

  return processors;
}


/**
 * Builds a new processor.
 * @param {string} matchingUrl The URL of the link that was found.
 * @param {string} searchPattern The search pattern associated.
 * @returns {object} A new processor.
 */
function newProcessor(matchingUrl, searchPattern) {
  return {
    id: uuid(),
    matchingUrl: matchingUrl,
    searchPattern: searchPattern,
    extMethod: findExtractionMethod(searchPattern),
    status: ProcessorStatus.WAITING,
    downloadLinks: []
  };
}


/**
 * Finds the extraction method for a given search pattern.
 * @param {string} searchPattern The search pattern.
 * @returns {integer} The ID of an extraction method.
 */
function findExtractionMethod(searchPattern) {

  var theExtMethod = 0;
  for (var extMethod in ExtMethods) {
    var p = ExtMethods[extMethod].pattern;
    if (searchPattern.match(p)) {
      theExtMethod = ExtMethods[extMethod].id;
      break;
    }
  }

  return theExtMethod;
}


/**
 * Handles a processor to retrieve download links.
 * @param {object} processor The processor.
 * @param {object} extractor The extractor object, with methods to find download links in a HTML page.
 * @param {object} processingQueue The processing queue, to reschedule an item.
 * @returns {undefined}
 */
function handleProcessor(processor, extractor, processingQueue) {

  var links = null;
  if (ExtMethods.SELF.id === processor.extMethod) {
    links = extractor.self(processor.matchingUrl);

  } else if (ExtMethods.REPLACE.id === processor.extMethod) {
    var match = ExtMethods.REPLACE.pattern.exec(processor.searchPattern);
    links = extractor.replace(processor.matchingUrl, match[1].trim(), match[2].trim());
    ExtMethods.REPLACE.pattern.lastIndex = 0;

  } else if (! processor.xmlDoc && processor.status === ProcessorStatus.WAITING) {
    processor.status = ProcessorStatus.RETRIEVING_LINKS;
    loadRemoteDocument(processor.matchingUrl).then( function(xmlDoc) {
      // Store the document and resubmit the processor
      processor.xmlDoc = xmlDoc;
      processor.status = ProcessorStatus.RETRIEVING_LINKS_DONE;
      processingQueue.append(processor);

    }, function() {
      processor.status = ProcessorStatus.RETRIEVING_LINKS_FAILURE;
    });

  } else if (processor.status === ProcessorStatus.RETRIEVING_LINKS) {
    // We are already downloading the document, try again in 2 seconds
    setTimeout( function() {
      processingQueue.append(processor);
    }, 2000);

  } else if (!! processor.xmlDoc ) {

    if (ExtMethods.CLASS.id === processor.extMethod) {
      var match = ExtMethods.CLASS.pattern.exec(processor.searchPattern);
      links = extractor.xpath(processor.xmlDoc, '//img[@class=\'' + match[1].trim() + '\']/@src');
      ExtMethods.CLASS.pattern.lastIndex = 0;

    } else if (ExtMethods.ID.id === processor.extMethod) {
      var match = ExtMethods.ID.pattern.exec(processor.searchPattern);
      links = extractor.xpath(processor.xmlDoc, '//img[@id=\'' + match[1].trim() + '\']/@src');
      ExtMethods.ID.pattern.lastIndex = 0;

    } else if (ExtMethods.XPATH.id === processor.extMethod) {
      var match = ExtMethods.XPATH.pattern.exec(processor.searchPattern);
      links = extractor.xpath(processor.xmlDoc, match[1].trim());
      ExtMethods.XPATH.pattern.lastIndex = 0;

    } else if (ExtMethods.EXPREG.id === processor.extMethod) {
      var match = ExtMethods.EXPREG.pattern.exec(processor.searchPattern);
      links = extractor.expreg(processor.xmlDoc, match[1].trim());
      ExtMethods.EXPREG.pattern.lastIndex = 0;
    }
  }

  if (!! links) {
    links.forEach( function(link) {
      processor.downloadLinks.push({
        link: link,
        status: DlStatus.WAITING
      });
    });

    processor.status = ProcessorStatus.GOT_LINKS;
  }
}
