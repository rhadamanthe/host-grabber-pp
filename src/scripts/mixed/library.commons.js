// Default values for preferences

const defaultDictionaryUrl = 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
const defaultDlMaxParallel = 3;
const defaultDlClearCompleted = false;
const defaultDlShowViewWhenDlStarts = true;
const defaultDlAlwaysShowViewWhenDlStarts = true;
const defaultDlMoveDownloadViewWhenDlStarts = true;


// Constants

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


const domainPattern = /^\w[-\w\.]*\w$/;


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
  FAILURE: 3
};
