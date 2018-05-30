---
locale: "en"
---

# Host Grabber ++

Host Grabber is a web extension to find and download media files from a web page.

It was originally designed for [Mozilla Firefox](https://www.mozilla.org/firefox/new/).
It is somehow the successor of [Image Host Grabber](https://addons.mozilla.org/fr/firefox/addon/imagehost-grabber/),
with some differences thought:

* It is not restricted to images.
* It does not check for MIME types.
* It is a little more strict in terms of what can specified in **hosts.xml** files (no function).
* It has much more less options, for the moment. It is not planned to restore all the
options that existed before.


## Screenshots

*Later*


## Installation

*The web extension is not yet available on addons.mozilla.org.*


## Usage

Simply browse a web page and right-click anywhere.  
Then, click **Host Grabber &gt; Extract**.

Host Grabber will then analyze the source code, explore its content
and finds download links. Once this step is complete, downloading starts.

The analysis is performed against a dictionary that defines what and how to
find download links.


## Preferences

The default dictionary is hosted [here](https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml).  
You can define your own one if you want and specify it through the extension preferences.

*Details will be added later*.


## Notice

**This web site is not about managing a centralized list of hosts**.
You can fork [the original list](https://github.com/rhadamanthe/host-grabber-pp-host.xml),
add your own hosts and contribute them through a pull request.

As the author of the extension, I will upgrade the web extension itself.  
However, I do not intend nor want to manage everybody's list. So, it is highly possible that
a better list of hosts appears somewhere else.


## Hosts Definitions

[This page](hosts-definition.html) explains the various strategies available to find media files to download on a web page.


## Bugs, Feature Requests...

No bugs or feature request can be reported for the **hosts.xml** file.  
For the extension itself, you can submit them [here](https://github.com/rhadamanthe/host-grabber-pp/issues).


## Links

* [Source code](https://github.com/rhadamanthe/host-grabber-pp)
* Download: soon
* Original **hosts.xml** file on [Github](https://github.com/rhadamanthe/host-grabber-pp-host.xml/blob/master/hosts.xml)
