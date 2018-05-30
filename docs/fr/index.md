---
locale: "fr"
---

# Host Grabber ++

Host Grabber est une extension web qui extrait et télécharge des fichiers média depuis une page web en cours de visite.

Elle a été conçue à la base pour [Mozilla Firefox](https://www.mozilla.org/firefox/new/).
Elle est en quelque sorte le successeur de [Image Host Grabber](https://addons.mozilla.org/fr/firefox/addon/imagehost-grabber/),
avec quelques différences:

* Host Grabber ++ ne se limite pas à la récupération d'images.
* Le type MIME des fichiers téléchargés n'est pas vérifié.
* Le contenu du fichier **hosts.xml** est plus strict (pas de fonction).
* Les options sont limitées. Il n'est pas prévu de remettre toutes celles que possèdait *Image host Grabber*.


## Captures d'Écran

> Le projet est en version **alpha**.

<img src="../assets/images/dl-view-1.jpg" alt="La vue des téléchargements" />

<img src="../assets/images/dl-view-2.jpg" alt="Le menu contextuel" />


## Installation

Vous pouvez installer cette extension depuis [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/).


## Utilisation

Visitez la page web de votre choix, and faîtes un clic droit n'importe où.  
Puis cliquez sur **Host Grabber &gt; Extraire**.

Host Grabber analyse alors le code source de la page, explore son contenu and extrait les liens
de téléchargement. Les fichiers sont ensuite téléchargés.

L'analyse effectuée s'appuie sur un catalogue qui précise comment trouver les liens de téléchargement.


## Préférences

Le catalogue par défaut est hébergée [ici](https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml).  
Vous pouvez définir le vôtre et le référencer dans les préférences de l'extension..

*De plus amples détails seront ajoutés plus tard*.


## Remarque

**Ce site n'a pas vocation de gérer une liste centralisée pour les hébergeurs**.
Vous pouvez cloner [la liste originale](https://github.com/rhadamanthe/host-grabber-pp-host.xml),
ajouter vos propres défintiions et les contribuer via une *pull request*.

En tant qu'auteur de l'extension, je maintiendrai et ferai évoluer l'extension.  
En revanche, je ne compte pas m'occuper de la liste des hôtes. Il est donc probable qu'une meilleure liste
fera son apparition quelque part ailleurs.


## Définitions des Hôtes

[Cette page](definition-des-hotes.html) explique les stratégies possibles pour trouver les fichiers à télécharger
sur une page web.


## Bugs, Demandes d'Évolution...

Aucun ticket ne peut être créé pour le fichier **hosts.xml**.  
Les bugs et demandes d'évolution pour l'extension elle-même, peuvent être reportés [ici](https://github.com/rhadamanthe/host-grabber-pp/issues).


## Liens

* [Code source](https://github.com/rhadamanthe/host-grabber-pp)
* Téléchargement depuis [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/)
* Fichier **hosts.xml** original [sur Github](https://github.com/rhadamanthe/host-grabber-pp-host.xml/blob/master/hosts.xml)
