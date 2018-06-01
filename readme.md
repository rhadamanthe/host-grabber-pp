# Host Grabber ++
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![Build Status](https://travis-ci.org/rhadamanthe/host-grabber-pp.svg?branch=master)](https://travis-ci.org/rhadamanthe/host-grabber-pp)
[![Web site](docs/assets/images/badge.svg)](https://rhadamanthe.github.io/host-grabber-pp)
&nbsp;
[![Firefox](docs/assets/images/firefox_x24.png)]() [![Join the chat at https://gitter.im/host-grabber-pp/Lobby](https://badges.gitter.im/host-grabber-pp/Lobby.svg)](https://gitter.im/host-grabber-pp/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A web extension that allows to find and download media files from web pages.  
It was originally designed for Mozilla Firefox but might be adapted to other web browsers.

It works like the former [Image Host Grabber](https://addons.mozilla.org/fr/firefox/addon/imagehost-grabber/)
extension, but unlike it, it is not restricted to downloading images.

> **This an alpha version**.

> Notice 1: links extraction is working quite correctly, but downloading is very
> limited due to restrictions set by the Firefox API. I was thinking to rely on
> [Download Them All](https://www.downthemall.net/), but the extension is not yet available
> for the last Firefox versions.

> Notice 2: the list of hosts has been seriously purged.  
> And the current list is not always up-to-date.


## Roadmap

**Short-term**

* Make the **options** page more beautiful.
* Add a command to purge downloads.
* Add a command to retry a failed download.
* Add a redirection mechanism (e.g. for PixHost).
* Add a menu to display the download links without downloading them (download simulation).
* Add a panel to test URL and search patterns on the current tab.
* Add a way to manage a dictionary locally (add, remove, enable, disable rules).
* Update the list of hosts.

**Long-term**

* Add a separate menu to download direct images.
* Allow to use several dictionaries in the preferences.
* Enhance the downloading part. Join the efforts with DTA is an option.
* Maybe adapt it for other web browsers.


## Development

Source code is available on Github.  
To test and debug it live, use...

CLI options:

```properties
# Install dependencies
npm install

# Execute tests
npm test

# Verifying linting
npm run lint

# Package the extension to submit it to addons.mozilla.org
npm run build
```

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
