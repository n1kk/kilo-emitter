exports.config = {
  specs: [
    './tests/**/*.spec.ts'
  ],
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 10,
  sync: true,
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'result',
  // Enables colors for log output.
  coloredLogs: true,
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Saves a screenshot to a given path if a command fails.
  screenshotPath: './errorShots/',
  //
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  // with "/", then the base url gets prepended.
  baseUrl: 'http://localhost',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if Selenium Grid doesn't send response
  connectionRetryTimeout: 90000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',
  reporters: ['dot', 'spec', 'json', 'concise'],

  mochaOpts: {
    ui: 'bdd',
    compilers: ['ts:ts-node/register', 'ignore-styles', 'jsdom-global/register'],
    requires: []
  },

  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [{
    // maxInstances can get overwritten per capability. So if you have an in-house Selenium
    // grid with only 5 firefox instances available you can make sure that not more than
    // 5 instances get started at a time.
    maxInstances: 5,
    //
    browserName: 'firefox'
  }],

  services: ['selenium-standalone'],
  // Path where all logs from the Selenium server should be stored.
  seleniumLogs: './logs',
  // Array of arguments for the Selenium server, passed directly to child_process.spawn.
  // seleniumArgs: [],
  // Object configuration for selenium-standalone.install().
  // seleniumInstallArgs: {}

  desiredCapabilities: {
    browserName: 'chrome',    // options: `firefox`, `chrome`, `opera`, `safari`
    version: '27.0',          // browser version
    platform: 'XP',           // OS platform
    tags: ['tag1','tag2'],    // specify some tags (e.g. if you use Sauce Labs)
    name: 'my test',          // set name for test (e.g. if you use Sauce Labs)
    pageLoadStrategy: 'eager' // strategy for page load
  }
};
