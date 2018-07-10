'use strict';

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

  // Handle cases where the path patterns leads to a non-document
  if (! sourceDocument) {
    return processors;
  }

  // Fix the dictionaries parameter
  if (! Array.isArray(dictionaries)) {
    dictionaries = [dictionaries];
  }

  // Iterate over the dictionaries
  var source = sourceDocument.documentElement.innerHTML;
  for (var index = 0; index < dictionaries.length; index ++) {

    var dictionary = dictionaries[index];
    var dictionaryWrapper = parseAndVerifyDictionary(dictionary);
    dictionaryWrapper.items.forEach( function(item) {

      if (item.errors.length > 0) {
        //console.log('Errors were found for item ' + item.id);
        //item.errors.forEach( function(error) {
        //  console.log('[' + item.id + '] ' + error);
        //});
        return;
      }

      // Explore the current page?
      var urlPatternWrappers = [];
      var domainPattern = buildDomainPattern(item.domain);
      if (item.pathPattern === exploreCurrentPage
          && pageUrlMatches(url, domainPattern)) {

        var p = newProcessor(url, item.searchPattern, item.interceptors2);
        p.xmlDoc = sourceDocument;
        processors.push(p);
      }

      // Otherwise, find links to explore
      else {
        urlPatternWrappers = buildUrlPatterns(
            url,
            item.domain,
            item.pathPattern,
            item.id
        );
      }

      // Find all the URLs that match the given pattern
      var preventDuplicatesForOneDictionaryItem = [];
      urlPatternWrappers.forEach( function(urlPatternWrapper) {

        var regexp = new RegExp(urlPatternWrapper.pattern, 'ig');
        for (var match = regexp.exec(source); !! match; match = regexp.exec(source)) {

          // Relative links should not include any host
          if (urlPatternWrapper.excludeHost && match[1].includes('://')) {
            continue;
          }

          // Resolve relative links as absolute ones
          var fixedLink = fixRelativeLinks(match[1], url);
          item.interceptors1.forEach( function(interceptor) {
            var interceptorRegex = new RegExp(interceptor.replace, 'ig');
            fixedLink = fixedLink.replace(interceptorRegex, interceptor.by);
          });

          if (preventDuplicatesForOneDictionaryItem.indexOf(fixedLink) !== -1) {
            continue;
          }

          // Save the processor
          preventDuplicatesForOneDictionaryItem.push(fixedLink);
          var p = newProcessor(fixedLink, item.searchPattern, item.interceptors2);
          processors.push(p);
        }
      });
    });
  }

  return processors;
}


/**
 * Builds a new processor.
 * @param {string} matchingUrl The URL of the link that was found.
 * @param {string} searchPattern The search pattern associated.
 * @param {array} interceptors An array of interceptors to update found URLs.
 * @returns {object} A new processor.
 */
function newProcessor(matchingUrl, searchPattern, interceptors) {
  return {
    id: uuid(),
    matchingUrl: matchingUrl,
    searchPattern: searchPattern,
    extMethod: findExtractionMethod(searchPattern),
    status: ProcessorStatus.WAITING,
    interceptors: interceptors || [],
    downloadLinks: []
  };
}


/**
 * Resets a processor.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function resetProcessor(processor) {
  processor.downloadLinks = [];
  processor.status = ProcessorStatus.WAITING;
}


/**
 * Handles a processor to retrieve download links.
 * @param {object} processor The processor.
 * @param {object} extractor The extractor object, with methods to find download links in a HTML page.
 * @param {object} queue The queue, to process another item.
 * @param {function} startDownloadFn The function to start downloading some file.
 * @param {function} updateProcessorInDownloadView The function to update the view.
 * @param {array} alreadyVisitedUrls The array of already visited URLs.
 * @returns {undefined}
 */
function handleProcessor(processor, extractor, queue, startDownloadFn, updateProcessorInDownloadView, alreadyVisitedUrls) {

  if (ExtMethods.SELF.id === processor.extMethod) {
    var links = extractor.self(processor.matchingUrl);
    onFoundLinks(processor, links, queue, startDownloadFn, updateProcessorInDownloadView, alreadyVisitedUrls);

  } else if (ExtMethods.REPLACE.id === processor.extMethod) {
    var match = ExtMethods.REPLACE.pattern.exec(processor.searchPattern);
    var links = extractor.replace(processor.matchingUrl, match[1].trim(), match[2].trim());
    ExtMethods.REPLACE.pattern.lastIndex = 0;
    onFoundLinks(processor, links, queue, startDownloadFn, updateProcessorInDownloadView, alreadyVisitedUrls);

  } else if (!! processor.xmlDoc) {
    var links = processDocument(processor, processor.xmlDoc, extractor);
    delete processor.xmlDoc; // Important! Otherwise, the processor will not be propagated to the view.
    onFoundLinks(processor, links, queue, startDownloadFn, updateProcessorInDownloadView, alreadyVisitedUrls);

  } else {
    processor.status = ProcessorStatus.RETRIEVING_LINKS;
    loadRemoteDocument(processor.matchingUrl).then( function(xmlDoc) {
      processor.status = ProcessorStatus.RETRIEVING_LINKS_DONE;
      var links = processDocument(processor, xmlDoc, extractor);
      onFoundLinks(processor, links, queue, startDownloadFn, updateProcessorInDownloadView, alreadyVisitedUrls);

    }, function() {
      processor.status = ProcessorStatus.RETRIEVING_LINKS_FAILURE;
      queue.processNextItem();
    });
  }
}


/**
 * Performs what is necessary when links were found (synchronously or asynchronously).
 * @param {object} processor The Processor to associated with the links.
 * @param {object} links The found links.
 * @param {object} queue The queue, to process the next item if no link was found.
 * @param {function} startDownloadFn The function that triggers the real download action.
 * @param {function} updateProcessorInDownloadView The function that updates the download view when links were found.
 * @param {array} alreadyVisitedUrls The array of already visited URLs.
 * @returns {undefined}
 */
function onFoundLinks(processor, links, queue, startDownloadFn, updateProcessorInDownloadView, alreadyVisitedUrls) {

  // If we have links, let things go on
  if (!! links && links.length > 0) {
    links.forEach( function(link, index) {

      // A found link might be relative.
      // So, make it absolute.
      var fixedLink = fixRelativeLinks(link, processor.matchingUrl);

      // Do we need to intercept the link?
      processor.interceptors.forEach( function(interceptor) {
        var interceptorRegex = new RegExp(interceptor.replace, 'ig');
        fixedLink = fixedLink.replace(interceptorRegex, interceptor.by);
      });

      // Was the link already downloaded?
      if (alreadyVisitedUrls.indexOf(fixedLink) !== -1) {
        return;
      }

      // Add the download link
      alreadyVisitedUrls.push(fixedLink);
      processor.downloadLinks.push({
        id: processor.id + '-' + index,
        link: fixedLink,
        status: DlStatus.WAITING
      });
    });

    // Show the links
    updateProcessorInDownloadView(processor);

    // Start downloading
    processor.status = ProcessorStatus.GOT_LINKS;
    processor.downloadLinks.forEach(function(dlLink) {
      startDownloadFn(dlLink, processor);
    });
  }

  // Otherwise, process the next item in the queue
  else {
    processor.status = ProcessorStatus.NO_LINK_FOUND;
    updateProcessorInDownloadView(processor);
    queue.processNextItem();
  }
}


/**
 * Processes a downloaded document (asynchronous search of links).
 * @param {object} processor The processor.
 * @param {object} xmlDoc The XML / HTML document that was downloaded.
 * @param {object} extractor The extractor.
 * @returns {array} The found links (can be empty).
 */
function processDocument(processor, xmlDoc, extractor) {

  var links = [];
  if (ExtMethods.CLASS.id === processor.extMethod) {
    var match = ExtMethods.CLASS.pattern.exec(processor.searchPattern);
    links = extractor.xpath(xmlDoc, '//img[@class=\'' + match[1].trim() + '\']/@src');
    ExtMethods.CLASS.pattern.lastIndex = 0;

  } else if (ExtMethods.ID.id === processor.extMethod) {
    var match = ExtMethods.ID.pattern.exec(processor.searchPattern);
    links = extractor.xpath(xmlDoc, '//img[@id=\'' + match[1].trim() + '\']/@src');
    ExtMethods.ID.pattern.lastIndex = 0;

  } else if (ExtMethods.XPATH.id === processor.extMethod) {
    var match = ExtMethods.XPATH.pattern.exec(processor.searchPattern);
    links = extractor.xpath(xmlDoc, match[1].trim());
    ExtMethods.XPATH.pattern.lastIndex = 0;

  } else if (ExtMethods.EXPREG.id === processor.extMethod) {
    var match = ExtMethods.EXPREG.pattern.exec(processor.searchPattern);
    links = extractor.expreg(xmlDoc, match[1].trim());
    ExtMethods.EXPREG.pattern.lastIndex = 0;
  }

  return links;
}
