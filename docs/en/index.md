---
locale: "en"
---

Host Grabber is a web extension to find and download media files from a web page.

It was originally designed for [Mozilla Firefox](https://www.mozilla.org/firefox/new/).
It is somehow the successor of [Image Host Grabber](https://addons.mozilla.org/fr/firefox/addon/imagehost-grabber/),
with some differences thought:

* It is not restricted to images.
* It does not check for MIME types.
* It is a little more strict in terms of what can be specified in **hosts.xml** files (no function).
* It has much more less options, for the moment. It is not planned to restore all the
options that existed before.


## Screenshots

<img src="../assets/images/dl-view-1--v0.5.jpg" alt="The download view" class="screenshot" />

<img src="../assets/images/dl-view-2--v0.5.jpg" alt="The download view (selection menu)" class="screenshot" />

<img src="../assets/images/dl-view-3--v0.5.jpg" alt="The download view (remove menu)" class="screenshot" />

<img src="../assets/images/dl-view-4--v0.5.jpg" alt="The download view (retry menu)" class="screenshot" />

<img src="../assets/images/dl-view-5--v0.7.jpg" alt="The menu" class="screenshot" />

<img src="../assets/images/options-view-p1--v0.9.jpg" alt="The options page" class="screenshot" />

<img src="../assets/images/options-view-p2--v0.9.jpg" alt="The options page (following)" class="screenshot" />


## Installation

You can install it from [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/).  
From the version 0.7, a side-panel shows up the first time.
You can close it without worrying about it. By default, Firefox opens the side-panel
of every newly-installed extension that has one.


## Known Problems

**With Firefox:**

* No known problem.

**With Chrome:**

* Once this extension has been installed or upgraded, it is necessary to restart
Chrome, or to reload all the existing tabs (with the F5 key) that would need it.
Unlike firefox, Chrome does not reinject some scripts in already-loaded pages.

* In order to use this extension in good conditions with Chrome, it is necessary
to update the download preferences. All the files should be saved in the same
folder, and Chrome should not ask for the download location.
[A bug was reported to the Chrome team](https://bugs.chromium.org/p/chromium/issues/detail?id=417112).
 Feel free to vote for it, it may speed up its resolution.


## Usage

Simply browse a web page and right-click anywhere.  
Then, click **Host Grabber &gt; Extract and Download**.

Host Grabber will then analyze the source code, explore its content
and finds download links. Once this step is complete, downloading starts.
The analysis is performed against a dictionary that defines what and how to
find download links.

It is also possible to download direct image links and download
images from a selection on the page.


## Preferences

Here is a short description of the preferences.

* **Catalog URL**: the default dictionary is hosted [here](https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml).  
You can define your own one if you want and specify it through the extension preferences.
* **Automatically update the dictionary**: true to download the dictionary every time firefox starts.
Otherwise, the catalog is cached locally and this local copy must be updated manually from the options page.
* **Hide downloads that successfully completed**: this option hides from the extension's download view
all the downloads that were successful. Those with failures will remain visible.
* **Remove successful downloads from Firefox's download view**: this option removes from Firefox's download view
all the downloads that were successful. Those with failures will remain visible.
* **Open the download view when pages are analyzed**: this option seems quite explicit.
The default behavior is to open the view. It can be disabled with this option. 
* **Limit the number of simultaneous downloads**: this option allows to limit the number of
parallel downloads started by HG ++. Notice that by default, Firefox already limits the number
of active connections towards a same server (by default,
[this value](https://support.mozilla.org/fr/questions/992338) is 6).
* **Cache download links during sessions**: this option prevents a same file from being downloaded
several times during a same session. The cache can be cleared or even disabled.
* **Download directory**: by default, everything is downloaded in the same directory.
But it is also possible to dispatch files in sub-directories (by domain, date, title or even custom pattern).

### Custom Sub-Directory Paths

Here are the available tags if you want to customize the download directory.
You can mix these tags with constant values to build path.

| Tag        | Description                                 |
| ---------- | ------------------------------------------- |
| `%year%`   | Replaced by the current year (4 digits).    |
| `%month%`  | Replaced by the current month (2 digits).   |
| `%day%`    | Replaced by the current day (2 digits).     |
| `%hour%`   | Replaced by the current hour (2 digits).    |
| `%minute%` | Replaced by the current minutes (2 digits). |
| `%domain%` | Replaced by the page's URL domain.          |
| `%title%`  | Replaced by the page's title.               |

Example of custom pattern for a sub-directory: `firefox/%year%-%month%/`  
The resulting name or path will always be truncated to not exceed 160 characters.


## Notice

**This web site is not about managing a centralized list of hosts**.
You can fork [the original list](https://github.com/rhadamanthe/host-grabber-pp-host.xml),
add your own hosts and contribute them through a pull request.

As the author of the extension, I will upgrade the web extension itself.  
However, I do not intend nor want to manage everybody's list. So, it is highly possible that
a better list of hosts appears somewhere else.


## Hosts Definitions

[This page](hosts-definition.html) explains the various strategies available to find media files to download on a web page.


## Debugging

<img src="../assets/images/debug-view--v0.9.jpg" alt="The debug panel (for Firefox only)" class="screenshot" />

In Firefox, there is a debugging panel to create, edit and test dictionary rules.
You can access it with a right-click menu and by selecting **Host Grabber &gt; Show Debug Panel**.

This panel remains open, no matter what tab is selected.  
Once a rule is defined, it can be tested by browsing any web page. By clicking the
**Extract Links** button, the page is analyzed with this single rule. Links are extracted,
and displayed in a separate view, but nothing is downloaded. This is only to help writing dictionary items.


## Reuse by Other Web Extensions

The first use case for this extension is to be invoked by a user through a menu
or a shortcut. However, it may also be used by other web extensions through an API.
They can indeed send a request to HG ++ so that it explores a given URL and downloads
media files from it.

Here is a sample code showing how to invoke HG ++ from your own extension.  
Notice that IG ++ does not return any response, it only explores the URL,
opens its downloads view and retrieves the media files it found.

```javascript
browser.runtime.sendMessage(
  '{1a70f086-e7b8-43da-8171-e3e5c532ad4f}',
  {
    req: 'explore-page',
    page: 'The URL of the page to explore.'
  }
);
```


## Bugs, Feature Requests...

No bugs or feature request can be reported for the **hosts.xml** file.  
For the extension itself, you can submit them [here](https://github.com/rhadamanthe/host-grabber-pp/issues).


## Links

* [Source code](https://github.com/rhadamanthe/host-grabber-pp)
* Download from [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/)
* [Release notes](https://github.com/rhadamanthe/host-grabber-pp/releases)
* Chat on [Gitter](https://gitter.im/host-grabber-pp/Lobby)
* Original **hosts.xml** file on [Github](https://github.com/rhadamanthe/host-grabber-pp-host.xml/blob/master/hosts.xml)
