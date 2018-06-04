---
locale: "fr"
---

# Définitions des Hôtes

Cette page explique les différentes stratégies pour récupérer les fichiers à télécharger
sur un site donné.

> Des compétences en informatique sont un sérieux atout ici.    
> **Une bonne connaissance de XML, XPath et des expressions régulières facilitera la compréhension.**


## Fichier Hosts.xml

Les définitions des hôtes sont centralisées dans un fichier XML.  
L'emplacement de ce fichier peut être changé dans les préférences de l'extension.

Le fichier XML contient une structure hiérarchique qui ressemble à...

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

Chaque hôte est associé à un item.  
Pour ajouter un nouvel hôte, il suffit donc de rajouter un item dans ce fichier.
Il est même possible de définir plusieurs items pour un même hôte. Par exemple...

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

Il est recommandé de leur donner des ID différents.  
Cet identifiant sert en cas d'erreur à corriger ou en cas d'évolution.


## Domaine

Le domaine concerne celui des liens à découvrir et explorer.  
Par exemple, si l'on souhaite trouver tous les liens qui pointent vers `http://toto.net``,
alors le nom de domain est `toto.net`.

```xml
<domain>toto.net</domain>
```

Lorsque vous définissez un domaine, HG ++ considérera tous les préfixes *http*, *https*,
*www.*, ainsi que les sous-domaines. La valeur d'un domaine est un simple texte. Ce n'est pas une
expression régulière.


## Modèle de Chemin

Le modèle de chemin (*path pattern*) est une [expression régulière](http://www.expreg.com)
qui **permet d'identifier quoi explorer** sur un domaine donné.  
Quand vous visitez une page web et que vous activez Host Grabber, celui-ci analyse le code source
de la page. Toutes les parties de texte qui correspondent au domaine et au modèle de chemin vont être
mises de côté pour une analyse détaillée.

Ainsi, si vous visitez un forum avec des images, le modèle d'URL permet de trouver les liens
qui mènent aux sites qui hébergent ces images.

Ce guide n'a pas pour ambition d'expliquer ce qu'est une expression régulière.  
Cependant, voici un exemple pour trouver les pages hébergées par *mon-hebergeur*.

```xml
<path-pattern>.+\.jpg</path-pattern>
```

Il y a quelques règles à connaître pour la définition de cette propriété.

* Elle ne peut pas commencer par `/`.
* Elle ne peut pas commencer par `^`.
* Elle ne peut pas finir par `$`.
* Le symbole `.` sera remplacé par `[^<>"]`.
* Pour obtenir le symbole `.`, il faut écrire `&dot`.
* L'entité HTML `<` doit être écrite sous la forme `&lt;`.
* L'entité HTML `>` doit être écrite sous la forme `&gt;`.
* L'entité HTML `&` doit être écrite sous la forme `&amp;`.


## Redirection

Il peut arriver que certains hébergeurs changent de nom de domaine.  
C'est assez rare, mais c'est pourtant ce qui est arrivé à PixHost. Jusqu'à
fin 2017, ce site utilisait le domaine **pixhost.org**. Depuis 2018, il a perdu ce nom
de domaine et a dû basculer sur **pixhost.to**. Host Grabber ++ propose un mécanisme pour
rediriger les références du « .org » vers le « .to ».

Voici un exemple...  
Quand un lien est trouvé et qui pointe vers pixhost.org, l'extension ira sur la bonne
page mais sur le domaine pixhost.to. Cette redirection est effectuée avant l'application du
modèle de recherche. Cela fonctionne donc avec toutes les stratégies décrites plus bas.

```xml
<host id="pixhost-org">
	<domain>pixhost.org</domain
	<path-pattern>show/.+</path-pattern>
	<redirect-from>pixhost.org/</redirect-from>
	<redirect-to>pixhost.to/</redirect-to>
	<search-pattern>ID: image</search-pattern>
</host>
```

Le remplacement est textuel.  
Pas d'expression régulière dans les éléments **redirect-from** et **redirect-to**.


## Modèle de Recherche

Le modèle d'URL permet de trouver quoi explorer.    
**The modèle de recherche (*search pattern*) permet de trouver les liens de téléchargement parmi ce qu'il faut explorer.**
Plusieurs stratégies sont disponibles. Certaines sont gourmandes en ressources, d'autres non. Elles sont détaillées ci-dessous.

* [Self](#self)
* [Replace](#replace)
* [ID](#id)
* [Class](#class)
* [XPath](#xpath)
* [Expreg](#expreg)


### SELF

Il s'agît de la stratégie la plus simple.  
Ici, le modèle d'URL détermine quoi télécharger.

**Syntaxe de Référence :** `self` (insensible à la casse)  
**Exemple :** liens directs vers des images.

```xml
<domain>toto.com</domain>
<path-pattern>.*\.(jpg|png|gif)</path-pattern>
<search-pattern>SELF</search-pattern>
```

Le modèle d'URL permet ici de trouver tous les fichiers JPG, PNG et GIF dans la page.  
Et **self** implique de télécharger directement ces éléments, sans plus d'analyse.


### Replace

Il s'agît d'une stratégie économe.  
Elle repose sur l'idée que le lien de téléchargement peut être déduit du modèle d'URL.

**Syntaxe de Référence :** `replace: 'expression régulière', 'remplacement'` (insensible à la casse)  
**Exemple :** galerie d'images avec miniatures.

```xml
<domain>toto.com</domain>
<path-pattern>.*\.(jpg|png|gif)</path-pattern>
<search-pattern>replace: 'tn_', ''</search-pattern>
```

Ce modèle d'URL identifie des images qui pourraient être des miniatures.  
And le modèle de recherche permet de remplacer certains segments de l'URL.

Notez que l'on peut aussi utiliser une expression régulière pour la recherche.

```xml
<domain>toto.com</domain>
<path-pattern>.*\.(jpg|png|gif)</path-pattern>
<search-pattern>replace: 'images/mini/([^/]+)/tn_(.*)', 'images/originales/$1/$2'</search-pattern>
```

Avec ce modèle de recherche, une miniature située à l'adresse `http://toto.com/images/mini/novembre-2017/tn_01.jpg`
serait résolue en `http://toto.com/images/originales/novembre-2017/01.jpg`. **$1** et **$2** sont des références vers des
groupes de capture (les segments entre parenthèses dans l'expression régulière).


### ID

ID est une stratégie gourmande.  
Elle implique de télécharger les pages pointées par les liens trouvés lors de l'exploration.

Par exemple, si le modèle d'URL a permis d'identifier un lien vers *mon-hebergeur*, alors Host Grabber
va le suivre, télécharger la page et l'analyser pour en extraire les médias à téléchager. Dans ce cas précis,
les liens de téléchargement sont trouvés en cherchant un élément HTML dont l'ID est spécifié dans le modèle de recherche.
Pour rappel, un ID est unique au sein d'une page web. Deux éléments ne peuvent pas avoir le même.

**Syntaxe de Référence :** `ID: l'id html` (insensible à la casse)  
**Exemple :** plusieurs hébergeurs d'images.

```xml
<domain>mon-hebergeur.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern>ID: image</search-pattern>
```

En supposant que ce modèle d'URL mène à des liens du genre `http://mon-hebergeur.com/view.php?01.jpg`,
Host Grabber les suivraient tous, téléchargerait les pages cibles et les analyserait. Chaque page ayant un
élément HTML avec l'ID spécifié donnerait lieu à un téléchargement.


### Class

Class est une stratégie gourmande.  
Elle implique de télécharger les pages pointées par les liens trouvés lors de l'exploration.

Par exemple, si le modèle d'URL a permis d'identifier un lien vers *mon-hebergeur*, alors Host Grabber
va le suivre, télécharger la page et l'analyser pour en extraire les médias à téléchager. Dans ce cas précis,
les liens de téléchargement sont trouvés en cherchant un élément HTML dont la classe est spécifiée dans le modèle de recherche.

**Syntaxe de Référence :** `Class: la classe html` (insensible à la casse)  
**Exemple :** plusieurs hébergeurs d'images.

```xml
<domain>mon-hebergeur.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern>Class: image</search-pattern>
```

En supposant que ce modèle d'URL mène à des liens du genre `http://mon-hebergeur.com/view.php?01.jpg`,
Host Grabber les suivraient tous, téléchargerait les pages cibles et les analyserait. Chaque page ayant des
éléments HTML avec la classe spécifiée donnerait lieu à des téléchargements.


### XPath

ID est une stratégie gourmande.  
Elle implique de télécharger les pages pointées par les liens trouvés lors de l'exploration.

Par exemple, si le modèle d'URL a permis d'identifier un lien vers *mon-hebergeur*, alors Host Grabber
va le suivre, télécharger la page et l'analyser pour en extraire les médias à téléchager. Dans ce cas précis,
les liens de téléchargement sont trouvés en cherchant un élément ou un attribut HTML grâce à une [expression XPath](https://fr.wikipedia.org/wiki/XPath).

**Syntaxe de Référence :** `XPath: une expression XPath` (insensible à la casse)  
**Exemple :** plusieurs hébergeurs d'images.

```xml
<domain>mon-hebergeur.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern>XPath: //div[@class=image-container]/img/@src</search-pattern>
```

En supposant que ce modèle d'URL mène à des liens du genre `http://mon-hebergeur.com/view.php?01.jpg`,
Host Grabber les suivraient tous, téléchargerait les pages cibles et les analyserait. Les liens de téléchargement
seraient trouvés en cherchant une balise **img**, située sous une balise **div** ayant **image-container** comme classe.

Notez que les stratégies **Class** et **ID** sont des raccourcis pour la stratégie **XPath**.


### Expreg

Expreg est une stratégie gourmande.  
Elle implique de télécharger les pages pointées par les liens trouvés lors de l'exploration.

Par exemple, si le modèle d'URL a permis d'identifier un lien vers *mon-hebergeur*, alors Host Grabber
va le suivre, télécharger la page et l'analyser pour en extraire les médias à téléchager. Dans ce cas précis,
les liens de téléchargement sont trouvés grâce à une expression régulière.

**Syntaxe de Référence :** `Expreg: a regular expression` (insensible à la casse)  
**Exemple :** plusieurs hébergeurs d'images.

```xml
<domain>mon-hebergeur.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern><![CDATA[expreg: <meta property="og:image"\s+content="([^"]+)"]]></search-pattern>
```

En supposant que ce modèle d'URL mène à des liens du genre `http://mon-hebergeur.com/view.php?01.jpg`,
Host Grabber les suivraient tous, téléchargerait les pages cibles et les analyserait. Les liens de téléchargement
seraient trouvés grâce à une expression régulière. Si un groupe de capture est présent, son contenu est résolu
en tant que lien de téléchargement. Autrement, c'est la correspondance toute entière qui est prise. Voici un exemple
pour illustrer ce cas (aucune parenthèse dans l'expression régulière).

```xml
<domain>mon-hebergeur.com</domain>
<path-pattern>view\.php\?.*\.(jpg|png|gif)</path-pattern>
<search-pattern><![CDATA[expreg: http://.*/grandes/.*\.jpg]]></search-pattern>
```

Ici, seules les images localisées dans le répertoire **grandes** seront téléchargées.

> Vous avez dû remarquer l'utilisation de sections CDATA dans ces derniers exemples.  
> Elles sont utilisées pour prévenir des erreurs au niveau XML.


## Liens Relatifs

Les liens relatifs sont résolus par rapport à la page où ils ont été trouvés.  
Ils sont donc correctement gérés.
