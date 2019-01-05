# Host Grabber ++
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![Build Status](https://travis-ci.org/rhadamanthe/host-grabber-pp.svg?branch=master)](https://travis-ci.org/rhadamanthe/host-grabber-pp)
[![Web site](docs/assets/images/badge.svg)](https://rhadamanthe.github.io/host-grabber-pp)
[![Join the chat at https://gitter.im/host-grabber-pp/Lobby](https://badges.gitter.im/host-grabber-pp/Lobby.svg)](https://gitter.im/host-grabber-pp/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Download on Mozilla's web site](https://img.shields.io/badge/install%20from-mozilla-%23ffd935.svg)](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/)
&nbsp; ![Firefox](docs/assets/images/firefox_x24.png)

A web extension that allows to find and download media files from various hosts.  
It was originally designed for Mozilla Firefox but might be adapted to other web browsers.

It works like the former [Image Host Grabber](https://addons.mozilla.org/fr/firefox/addon/imagehost-grabber/)
extension, but unlike it, it is not restricted to downloading images.

> **This module is in beta version**.

> Notice: the list of hosts has been seriously purged.  
> And the current list is not always up-to-date.


## Roadmap

**Short-term**

* Add a way to manage a dictionary locally (add, remove, enable, disable rules).
* Add a separate menu to download direct images.


## Development

Source code is available on Github.  
Test assertions are written with [expect.js](https://www.npmjs.com/package/expect.js?activeTab=versions).  
To test and debug it live, use...

CLI options:

```properties
# Install dependencies
npm install

# Execute tests on both Chrome and Firefox
npm test

# Execute tests for Firefox only
npm run test-firefox

# Execute tests for Chrome only
npm run test-chrome

# Verifying linting
npm run lint

# Package the extension to submit it to addons.mozilla.org
npm run build
```


## Testing in Firefox

Testing in a separate browser:

* Make sure you have followed the previous instructions (CLI options).
* Then type in **npm run web-ext** in your terminal.
* A new instance of the browser will be launched.

Testing in your usual browser:

* Open **about:debugging** in Firefox.
* Click **Load Temporary Add-on** and select any file in the module's sources.

Debugging the extension:

* Open **about:debugging** in Firefox.
* Click **Load Temporary Add-on** and select any file in the module's sources.
* Check the box labeled **Enable add-on debugging**.
* Click the **Debug** button next to the extension.
* Click **OK** in the warning dialog.


## Testing in Chrome / Chromium

Testing in your usual browser:

* Open **chrome:extensions** in Firefox.
* Make sure the page is in developer mode.
* Click **Load unpacked** and select any file in the module's sources.

You can debug it by clicking **Inspect views: background page**.


## Testing the Documentation

```
cd docs/
docker run --rm --label=jekyll --volume=$(pwd):/srv/jekyll -it -p 4000:4000 jekyll/jekyll jekyll serve
```

Notice that the startup takes a little time.


## Source Code Organization

This project is a web extension, originally created for Mozilla Firefox.  
However, it should be possible to adapt it for other web browsers. The source code organization
may help for this.

* **library.\*.js** files are pure Javascript files. They are independent from browser code. **They must be tested with unit tests!**
* Other Javascript files contain browser specific code.
