---
locale: "en"
---

# Hosts Definitions

This page explains the available strategies to gather download links
for a given web site.

> Notice that having skills in Software Development is a serious asset here.  
> **Prior knowledge about XML, XPath and regular expressions really helps to understand this page.**


## Hosts.xml File

All the hosts definitions must be gathered in a single XML file.  
The location of this XML file can be defined in the extension's preferences.

The XML file contains a hierarchical structure that looks like...

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>

	<host id="host 1">
		<domain>...</domain>
		<path-pattern>...</path-pattern>
		<search-pattern>...</search-pattern>
	</host>
	
	<host id="host 2">
		<domain>...</domain>
		<path-pattern>...</path-pattern>
		<search-pattern>...</search-pattern>
	</host>

</root>
```

Each host has its own item.  
So, if you want to add a new host, you only have to add an item in such a file.
It is even possible for a host to be associated with several items. As an example...

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>

	<host id="instagram-pics">
		<domain>...</domain>
		<path-pattern>...</path-pattern>
		<search-pattern>...</search-pattern>
	</host>
	
	<host id="instagram-vids">
		<domain>...</domain>
		<path-pattern>...</path-pattern>
		<search-pattern>...</search-pattern>
	</host>

</root>
```

Just give the items a different ID.  
The ID is useful when there is an error to fix or an upgrade to perform.


## Domain

The domain is the one of the links we want to discover and explore.  
As an example, if you want to explore links that point to `http://toto.net``, the domain
name is `toto.net`.

```xml
<domain>toto.net</domain>
```

When you define a domain, HG ++ will consider all the links with *http*, *https*,
*www.* prefixes, as well as sub-domains. The value of a domain is a text. Not a regular expression. 


## Path Pattern

The path pattern is a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
that **helps to find what to explore** on a given domain.  
Basically, when you visit a web page and activates Host Grabber, it analyzes the source code.
All the text parts that match the domain and path pattern will be kept for further analysis.

As an example, if you are visiting a forum with images, the URL pattern will help to find
the links that lead to the web sites that host these images.

It is not in this guide's objectives to explain what a regular expression is.  
However, here is an example of URL pattern to find pages hosted by *my-image-host*.

```xml
<path-pattern>.+\.jpg</path-pattern>
```

There are some rules to know when setting this property

* It cannot start with `/`.
* It cannot start with `^`.
* It cannot end with `$`.
* The `.` symbol will be replaced by `[^<>"]`.
* To get the `.` symbol, one should write `&dot`.
* The HTML entity for `<` must be written `&lt;`.
* The HTML entity for `>` must be written `&gt;`.
* The HTML entity for `&` must be written `&amp;`.


## Search Patterns

The URL pattern allows to find what to explore.  
**The search pattern allows to find download links once we know what to explore.**
And there are several strategies. Some are more greedy than others. Let's take a look at them.

* [Self](#self)
* [Replace](#replace)
* [ID](#id)
* [Class](#class)
* [XPath](#xpath)
* [Expreg](#expreg)


### SELF

This is the most simple strategy.  
It considers the URL pattern allows to find what to download.

**Reference syntax:** `self` (case-insensitive)  
**Example:** embedded images in pages.

```xml
<domain>toto.com</domain>
<path-pattern>.*\.(jpg|png|gif)</path-pattern>
<search-pattern>SELF</search-pattern>
```

The URL pattern here allows to find all the JPG, PNG and GIF images referenced in the page.  
And **self** means we directly download them. No need to search further.


### Replace

This is another non-greedy strategy.  
It assumes we can find a download link from the matches we found with the URL pattern.

**Reference syntax:** `replace: 'regular expression to search', 'replacement string'` (case-insensitive)  
**Example:** image gallery with thumbnails.

```xml
<domain>toto.com</domain>
<path-pattern>.*\.(jpg|png|gif)</path-pattern>
<search-pattern>replace: 'tn_', ''</search-pattern>
```

The URL patterns identifies images, that may be thumbnails.  
And the search pattern replaces parts of the URL to lead to the real image.

Notice you can use regular expressions for the search.

```xml
<domain>toto.com</domain>
<path-pattern>.*\.(jpg|png|gif)</path-pattern>
<search-pattern>replace: 'images/thumbs/([^/]+)/tn_(.*)', 'images/originals/$1/$2'</search-pattern>
```

With such a search pattern, a thumbnail located at `http://toto.com/images/thumbs/november-2017/tn_01.jpg`
would be resolved to `http://toto.com/images/originals/november-2017/01.jpg`. **$1** and **$2** are references
to the captured groups (the segments in-between brackets).


### ID

ID is a greedy-strategy.  
It considers the link found by the URL pattern must be downloaded and analyzed.

> Except if the [path pattern points to the current tab](#current-page). 

As an example, if the URL pattern identified a link to *my-image-host*, then Host Grabber
follows the link and downloads the page. It then analyzes it to extract the information. Here,
the link is found by searching an image whose HTML ID is the one given in the search pattern. As a reminder,
a HTML ID is supposed to be unique within a page.

**Reference syntax:** `ID: the html id` (case-insensitive)  
**Example:** many web image hosts.

```xml
<domain>image-host.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern>ID: image</search-pattern>
```

Assuming this URL pattern finds a set of links that look like `http://image-host.com/view.php?01.jpg`,
Host Grabber will follow all of them, download the pages and analyze them. Each page having a HTML element
with the specified ID with result in an item to download.


### Class

Class is a greedy-strategy.  
It considers the link found by the URL pattern must be downloaded and analyzed.

> Except if the [path pattern points to the current tab](#current-page).

As an example, if the URL pattern identified a link to *my-image-host*, then Host Grabber
follows the link and downloads the page. It then analyzes it to extract the information. Here,
the link is found by searching an image whose HTML class is the one given in the search pattern.
All the elements with the specified class will be downloaded.

**Reference syntax:** `Class: the html class` (case-insensitive)  
**Example:** many web image hosts.

```xml
<domain>image-host.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern>Class: image</search-pattern>
```

Assuming this URL pattern finds a set of links that look like `http://image-host.com/view.php?01.jpg`,
Host Grabber will follow all of them, download the pages and analyze them. Each page having HTML elements
with the specified class with result in items to download.


### XPath

XPath is a greedy-strategy.  
It considers the link found by the URL pattern must be downloaded and analyzed.

> Except if the [path pattern points to the current tab](#current-page).

As an example, if the URL pattern identified a link to *my-image-host*, then Host Grabber
follows the link and downloads the page. It then analyzes it to extract the information. Here,
links are found by searching a HTML element or attribute with a [XPath expression](https://wikipedia.org/wiki/XPath).

**Reference syntax:** `XPath: a XPath expression` (case-insensitive)  
**Example:** many web image hosts.

```xml
<domain>image-host.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern>XPath: //div[@class=image-container]/img/@src</search-pattern>
```

Assuming this URL pattern finds a set of links that look like `http://image-host.com/view.php?01.jpg`,
Host Grabber will follow all of them, download the pages and analyze them. The download links will be found
by searching an **img** mark-up, located under a **div** with the **image-container** class.

Notice that the **Class** and **ID** strategies are shortcuts to the **XPath** strategy.


### Expreg

Expreg is a greedy-strategy.  
It considers the link found by the URL pattern must be downloaded and analyzed.

> Except if the [path pattern points to the current tab](#current-page).

As an example, if the URL pattern identified a link to *my-image-host*, then Host Grabber
follows the link and downloads the page. It then analyzes it to extract the information. Here,
links are found by searching with a regular expression.

**Reference syntax:** `Expreg: a regular expression` (case-insensitive)  
**Example:** many web image hosts.

```xml
<domain>image-host.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern><![CDATA[expreg: <meta property="og:image"\s+content="([^"]+)"]]></search-pattern>
```

Assuming this URL pattern finds a set of links that look like `http://image-host.com/view.php?01.jpg`,
Host Grabber will follow all of them, download the pages and analyze them. The download links will be found
with a regular expression. If a capture group is defined, its content will be resolved as the download link.
If there is no capture, then the entire match is kept. Here is an example to illustrate this case (there is no
bracket in the regular expression).

```xml
<domain>image-host.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern><![CDATA[expreg: http://.*/big/.*\.jpg]]></search-pattern>
```

Here, it will only keep JPG images located in the **big** directory.

> You might have notice a CDATA section in these last examples.  
> There are used to prevent invalid characters in XML.


### Current Page

If the path pattern has the special value `_$CURRENT$_` and that the current web page matches
the domain, then search patterns are applied on the current page. It means there is no additional
link to explore, we explore the current page.

In this example...

```xml
<domain>toto.com</domain>
<path-pattern>_$CURRENT$_</path-pattern>
<search-pattern>CLASS: img</search-pattern>
```

... if we are visiting a page from the *toto.com* domain, we will search for all the images
whose CSS class is *img*. It works with all the search pattern strategies.


## Interceptors

HG ++ explores web pages to discover download links. But sometimes, the
URL we find are not exactly those we want. Sometimes also, web sites might
change their domain address. This is very rare. And still it is what happened
to PixHost. It used to be reachable to **pixhost.org**. At the beginning of 2018,
it lost its domain and had to adopt **pixhost.to**.

Anyway, Host Grabber ++ provides a redirection mechanism.
It can be used, as an example, to redirect from an ancient domain to a new one. Or to target
something we know but could not find.

Here is an example...  
When it finds a link that points to pixhost.org, it will inspect the right page
but on pixhost.to.

```xml
<host id="pixhost-org">
	<domain>pixhost.org</domain
	<path-pattern>show/.+</path-pattern>
	<interceptor>replace: '\.org/', '.to/'</interceptor>
	<search-pattern>ID: image</search-pattern>
</host>
```

The interceptor replaces a part of the URL by another one.  
The syntax is the same than [the replace directive in search patterns](#replace).

An interceptor may appear in several locations.

* After a **path-pattern** mark-up: replacement will be done on the found links, those that must be explored.
* After a **search-pattern** mark-up: replacement will be done on the links found after exploration.

You can define several interceptors if necessary.

```xml
<host id="pixhost-org">
	<domain>pixhost.org</domain
	<path-pattern>show/.+</path-pattern>
	
	<!-- Explore another page that the one found in the current tab. -->
	<interceptor>replace: '\.org/', '.to/'</interceptor>
	<interceptor>replace: 'show/', 'view/'</interceptor>
	<search-pattern>ID: image</search-pattern>
	
	<!-- We found links to thumbnails in the document. Redirect to bigger images. -->
	<interceptor>replace: '_tn\.jpg', '_big.jpg'</interceptor>
</host>
```

Because exploration could be end-less, we fixed a limit to the recursive approach. There might be pages
or web sites for which combining search patterns and interceptors may not be enough. But this provides
enough flexibility for most of the situations.
 

## Relative Links

Relative links are resolved against the web page where they were found.  
Therefore, they are handled correctly.
