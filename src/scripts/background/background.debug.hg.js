// The code in "background.hg.js" is already complicated.
// Rather than adding more parameters and options, and thus
// making it more complex, we put everything related to the
// debug panel apart, and copy what we need.

var simulationQueue = {};
var simulationPageUrl = '';
const TITLE_SIMULATION_VIEW = 'Simulation - HG ++';


browser.contextMenus.create({
  id: 'hg-menu-show-debug-panel',
  parentId: 'hg-menu',
  title: browser.i18n.getMessage('menu_showDebugPanel'),
  contexts: ['all'],
  onclick: showDebugPanel
});

browser.runtime.onMessage.addListener(request => {
  if (request.req === 'simulate-download') {
    simulateDownload(request.obj);

  } else if (request.req === 'get-simulation-processors') {
    var history = Array.from(simulationQueue.processingHistory.values());
    sendProcessorsToSimulationView(history, {pageUrl: simulationPageUrl});

  } else if (request.req === 'get-dictionary') {
    sendDictionaryToSidebar();
  }
});


/**
 * Performs an analysis and simulate downloads on the current tab.
 * @param {object} simulationDictionary The temporary dictionary, wrapped as an object created by library.dictionary.js.
 * @returns {undefined}
 */
function simulateDownload(simulationDictionary) {

  simulationQueue = newQueue();
  simulationQueue.handleProcessorFn = junkHandleProcessorFn(simulationQueue, newAlreadyVisitedUrls());

  // Start the download from the current tab
  browser.tabs.query({active: true, currentWindow: true}).then( tabs => {
    simulationPageUrl = tabs[0].url;
    browser.tabs.sendMessage( tabs[0].id, {req: 'source-code'}).then( sourceAsText => {
      simulateProcessing(sourceAsText, tabs[0].url, simulationQueue, simulationDictionary);
    });
  });
}


/**
 * Performs an analysis and simulate downloads.
 * @param {string} sourceAsText The source code to analyze.
 * @param {string} url The URL of the page.
 * @param {object} simulationQueue The simulation queue.
 * @param {object} simulationDictionary The temporary dictionary, wrapped as an object created by library.dictionary.js.
 * @returns {undefined}
 */
function simulateProcessing(sourceAsText, url, simulationQueue, simulationDictionary) {

  // Open the simulation tab
  showTab(TITLE_SIMULATION_VIEW, '/src/html/simulation-list.html');

  // Parse the source code and find the links
  var sourceDocument = new DOMParser().parseFromString(sourceAsText,'text/html');
  var processors = findWhatToProcess(sourceDocument, url, simulationDictionary);

  // We get link candidates to process and/or explore
  processors.forEach(function(processor) {
    simulationQueue.append(processor);
  });

  // Send a notification to the simulation view
  sendProcessorsToSimulationView(processors);

  // Start downloading
  simulationQueue.processNextItem();
}


/**
 * Sends processors to the simulation view.
 * @param {array} processors An array of processors.
 * @returns {undefined}
 */
function sendProcessorsToSimulationView(processors) {
  var options = {};
  options.clear = true;
  options.pageUrl = simulationPageUrl;
  sendProcessorsToTab(processors, TITLE_SIMULATION_VIEW, options);
}


/**
 * Updates a processor in the download view.
 * @param {object} processor A processor.
 * @returns {undefined}
 */
function updateProcessorInSimulationView(processor) {
  updateProcessorInTab(processor, TITLE_SIMULATION_VIEW);
}


/**
 * Handles the execution of a processor.
 * @param {object} simulationQueue The queue used in the simulation.
 * @param {object} simulationAlreadyVisitedUrls The object that manages the visited URLs.
 * @returns {undefined}
 */
function junkHandleProcessorFn(simulationQueue, simulationAlreadyVisitedUrls) {

  var replaceDownloadFn = function(linkObject, processor) {
    simulationQueue.processNextItem();
  };

  return function(processor) {
    handleProcessor(processor, extractor(), simulationQueue, replaceDownloadFn, updateProcessorInSimulationView, simulationAlreadyVisitedUrls);
  };
}


/**
 * Sends the dictionary, if it exists, to the side bar.
 * @returns {undefined}
 */
function sendDictionaryToSidebar() {

  if (!! dictionaryWrapper) {
    browser.runtime.sendMessage({req: 'this-dictionary', obj: dictionaryWrapper.items});
  }
}


/**
 * Shows the debug panel.
 * @returns {undefined}
 */
function showDebugPanel() {
  browser.sidebarAction.open();
}
