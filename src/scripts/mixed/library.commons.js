// Download strategies

/**
 * Download everything in the default directory.
 */
const DL_STRATEGY_DEFAULT = 1;

/**
 * Dispatch downloads in sub-directories, one per domain.
 */
const DL_STRATEGY_DIR_PER_DOMAIN = 2;

/**
 * Dispatch downloads in sub-directories, one per day (alphabetical).
 */
const DL_STRATEGY_DIR_PER_ALPHA_DATE = 3;

/**
 * Dispatch downloads in sub-directories, one per day (hierarchical).
 */
const DL_STRATEGY_DIR_PER_TREE_DATE = 4;

/**
 * Dispatch downloads in sub-directories, one per page's title.
 */
const DL_STRATEGY_DIR_PER_PAGE_TITLE = 5;


// Default values for preferences

const defaultDictionaryUrl = 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
const defaultDlMaxParallel = 3;
const defaultDlClearCompleted = false;
const defaultDlShowViewWhenDlStarts = true;
const defaultDlAlwaysShowViewWhenDlStarts = true;
const defaultDlMoveDownloadViewWhenDlStarts = true;
const defaultAutomaticallyUpdateDictionary = true;
const defaultDlCacheDownloadLinks = true;
const defaultHideSuccessfulDownloadItems = true;
const defaultDlStrategy = DL_STRATEGY_DEFAULT;


// Other constants

const ProcessorStatus = {
  WAITING: 1,
  RETRIEVING_LINKS: 2,
  GOT_LINKS: 3,
  DL_SUCCESS: 4,
  DL_FAILURE: 5,
  RETRIEVING_LINKS_FAILURE: 6,
  RETRIEVING_LINKS_DONE: 7,
  NO_LINK_FOUND: 8
};

const DlStatus = {
  WAITING: 1,
  SUCCESS: 2,
  FAILURE: 3,
  DOWNLOADING: 4,
  INVALID_MIME_TYPE: 5,
  UNEXPECTED_SMALL_SIZE: 6,
  ALREADY_DOWNLOADED: 7
};

const supportedDictionarySpecs = ['1.0'];
