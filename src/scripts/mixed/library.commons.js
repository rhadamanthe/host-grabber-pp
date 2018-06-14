// Default values for preferences

const defaultDictionaryUrl = 'https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml';
const defaultDlMaxParallel = 3;
const defaultDlClearCompleted = false;
const defaultDlShowViewWhenDlStarts = true;
const defaultDlAlwaysShowViewWhenDlStarts = true;
const defaultDlMoveDownloadViewWhenDlStarts = true;


// Constants

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
