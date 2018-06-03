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

> Le projet est en version **beta**.

<img src="../assets/images/dl-view-1--v0.3.jpg" alt="La vue des téléchargements" />

<img src="../assets/images/dl-view-2--v0.2.jpg" alt="Le menu contextuel" />

<img src="../assets/images/options-view--v0.3.jpg" alt="La page d'options" />


## Installation

Vous pouvez installer cette extension depuis [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/).


## Utilisation

Visitez la page web de votre choix, and faîtes un clic droit n'importe où.  
Puis cliquez sur **Host Grabber &gt; Extraire**.

Host Grabber analyse alors le code source de la page, explore son contenu and extrait les liens
de téléchargement. Les fichiers sont ensuite téléchargés.

L'analyse effectuée s'appuie sur un catalogue qui précise comment trouver les liens de téléchargement.


## Préférences

Voici une présentation des préférences disponibles.

* **URL du catalogue** : le catalogue par défaut est hébergé [ici](https://raw.githubusercontent.com/rhadamanthe/host-grabber-pp-host.xml/master/hosts.xml).  
Vous pouvez définir le vôtre et le référencer dans les préférences de l'extension.
* **Masquer les téléchargments terminés avec succès** : cette option enlève de la vue
des téléchargements, tous ceux qui se sont terminés avec succès. Ceux avec des échecs resteront visibles.
* **Limiter le nombre de téléchargements simultanés** : cette option permet de limiter
le nombre de téléchargements lancés par HG ++. Il faut noter aussi que Firefox limite de toute
façon le nombre de connexions simultanées vers un même serveur (par défaut,
[cette valeur](https://support.mozilla.org/fr/questions/992338) vaut 6).


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


## Réutilisation par d'autres Extensions Web

Le cas nominal d'utilisation de cette extension concerne une personne qui
lance une exploration par clic droit ou raccourci clavier. Toutefois, HG ++
propose aussi une API pour les autres extensions web. Cette API permet de lancer
HG ++ et d'explorer une URL donnée pour y découvrir et télécharger des fichiers média.

Voici un exemple de code pour utiliser cette API.  
Notez que HG ++ ne retourne aucune réponse. Il explore l'URL, ouvre sa
vue des téléchargements et récupère les liens découverts.

```xml
browser.runtime.sendMessage(
  'hg.pp@rhadamanthe.github',
  {
    req: 'explore-page',
    page: 'L'URL de la page à explorer.'
  }
);
```

## Bugs, Demandes d'Évolution...

Aucun ticket ne peut être créé pour le fichier **hosts.xml**.  
Les bugs et demandes d'évolution pour l'extension elle-même, peuvent être reportés [ici](https://github.com/rhadamanthe/host-grabber-pp/issues)

## Liens

* [Code source](https://github.com/rhadamanthe/host-grabber-pp)
* Téléchargement depuis [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/host-grabber-pp/)
* [Notes de livraisons](https://github.com/rhadamanthe/host-grabber-pp/releases)
* Salon de discussion sur [Gitter](https://gitter.im/host-grabber-pp/Lobby)
* Fichier **hosts.xml** original [sur Github](https://github.com/rhadamanthe/host-grabber-pp-host.xml/blob/master/hosts.xml)
