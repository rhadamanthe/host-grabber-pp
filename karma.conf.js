// Find the path of the local browsers
const path = require('path');
const { computeExecutablePath, Browser } = require('@puppeteer/browsers');

// Find the Chrome binary path
const executablePath = computeExecutablePath({
  browser: Browser.CHROME,
  buildId: 'stable',
  cacheDir: './browsers',
});

console.log(executablePath)
process.env.CHROME_BIN = executablePath;

// karma.conf.js
module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      // Test dependencies
      'node_modules/expect.js/index.js',
      'node_modules/sinon-chrome/bundle/sinon-chrome-webextensions.min.js',

      // Source
      'src/**/library.*.js',

      // Tests
      'tests/scripts/**/*.js',

      // Fixtures
      {
        pattern: './tests/resources/**/*.*',
        watched: false,
        served: true,
        included: false
      },
      {
        pattern: './_locales/**/*.json',
        watched: false,
        served: true,
        included: false
      }
    ],

    client: {
      mocha: {
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html'
      }
    },

    // pre-process matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.js': ['coverage']
    },

    // test results reporters to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'mocha', 'coverage'],

    mochaReporter: {
      showDiff: true
    },

    // configure the coverage reporter
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE, config.LOG_ERROR,
    // config.LOG_WARN, config.LOG_INFO, config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable/disable watching file and executing tests when any file changes
    autoWatch: false,

    // start these browsers
    browsers: ['CustomChromeHeadless'],
    customLaunchers: {
      CustomChromeHeadless: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox'
        ],
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browsers should be started simultaneously
    concurrency: Infinity
  });
};
