# Strapi plugin for Coog

- [Strapi plugin for Coog](#strapi-plugin-for-coog)
- [Architecture et Développement](#architecture-et-développement)
  - [Config](#config)
  - [Controllers](#controllers)
  - [Services](#services)
  - [Admin](#admin)
    - [Surcharge nécessaire Strapi](#surcharge-nécessaire-strapi)
- [Configuration et utilisation](#configuration-et-utilisation)
  - [Interface d’administration](#interface-dadministration)

Strapi permet d'ajouter des plugins afin d'étendre ses possibilités. Afin de pouvoir interagir avec Coog, nous avons développer un plugin spécifique, appelé Coog Connector.

Ce plugin permet, entre autres :
- de récupérer les informations et les contrats d'un tiers, ainsi que les documents relatifs à ces contrats
- Il permet également de récupérer les quittances de ces contrats et d’effectuer la régularisation de ces quittances via un paiement en ligne
- Il permet de lier automatiquement un utilisateur Strapi avec un tiers Coog. Ce tiers pouvant être un assuré et/ou souscripteur
- Une interface de configuration est disponible dans la partie administration de Strapi afin de configurer le plugin et la connexion à Coog

# Architecture et Développement

La documentation générale officielle (v3) du développement d’un plugin est disponible [ici](https://docs-v3.strapi.io/developer-docs/latest/development/local-plugins-customization.html).

## Config

Le fichier `config/functions/bootstrap.js` permet d'ajouter des permissions pour les nouvelles routes dans la page d'administration Strapi.  
La documentation sur le fichier `bootstrap.js` est disponible [ici](https://docs-v3.strapi.io/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap).

Le fichier `config/routes.json` permet de définir les différentes routes avec les policies et handler.  
La documentation des routes est disponible [ici](https://docs-v3.strapi.io/developer-docs/latest/development/backend-customization.html#routing).

## Controllers

Ce répertoire contient les différents contrôleurs.  
La documentation des controllers est disponible [ici](https://docs-v3.strapi.io/developer-docs/latest/development/backend-customization.html#controllers).

- `CoogConnector` : Permet de récupérer (`get`) et de sauvegarder (`update`) les paramètres du plugin.
- `Customer` : Permet de mettre à jour depuis Coog et retourner les tiers de l'utilisateur connecté (`find`), de récupérer un tiers depuis Coog (`findByCode`, uniquement pour les admin) et de télécharger un document (`documentsRequest`).
- `Form` : Permet de récupérer les données pour la questionnaire médical (`requestToken`), d'envoyer les réponses du questionnaire médical (`answersToken`) et d'envoyer les documents (`uploadToken`).
- `Member` : Permet de mettre à jour depuis Coog un tiers spécifique (`updateById`).
- `Payment` : Permet de créer un paiement (`create`).
- `User` : Permet de créer un utilisateur Strapi (`create`), d'obternir l'url de redirection pour l'activation d'un compte (`redirect`) et de valider le token d'activation (`validateToken`)

## Services

Ce répertoire contient les différents services, appelés par les contrôleurs, qui feront les actions adéquates.  
La documentation des services est disponible [ici](https://docs-v3.strapi.io/developer-docs/latest/development/backend-customization.html#services).

## Admin

Le répertoire `admin/src` contient le code source des pages d'administration du plugin.  
La documentation de la configuration d’administration est disponible [ici](https://docs-v3.strapi.io/developer-docs/latest/development/local-plugins-customization.html#main-plugin-object).

Le fichier `admin/src/index.js` contient les paramètres de la page d'administration.  
Le fichier `admin/src/containers/HomePage/index.js` contient la page principale d'administration du plugin.  
Le fichier `admin/src/components/CoogPlugin/index.js` contient le coeur de la page, il se présente comme un composant React classique.

### Surcharge nécessaire Strapi

L'extension `users-permissions` a été surchargé afin de pouvoir créer les User lors de la connexion.

Le fichier `controllers/Auth.js` a été surchargé pour permettre de créer un User lors d'une connexion via login/mdp. L'inviteToken a également été rajouté dans les paramètres personnalisables de la configuration Grant pour Auth0.

<details>
  <summary>Détails de la surcharge</summary>

  Dans la méthode `callback`, au niveau de la section `validPassword`, si le mot de passe est valide (lignes 228+), remplacer le code existant par :

  ```js
  const [createdUser, errorCreate] = await strapi
    .plugins['coog-plugin']
    .services
    .user
    .create({ ...user, inviteToken: params.inviteToken });

  if (errorCreate) {
    return ctx.badRequest(
      null,
      errorCreate === 'array' ? errorCreate[0] : errorCreate
    );
  }

  ctx.send({
    jwt: strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    }),
    refresh: generateRefreshToken(user),
    user: sanitizeEntity(
      createdUser.toJSON ? createdUser.toJSON() : createdUser,
      {
        model: strapi.query('user', 'users-permissions').model,
      }
    ),
  });
  ```

  A la fin de la méthode `connect` (lignes 343 : `async connect(ctx, next) {`), rajouter le code suivant juste avant le `return` (ligne 373) :

  ```js
  grantConfig[provider].custom_params = {
    inviteToken: ctx?.query?.inviteToken,
  };
  ```
</details>

Le fichier `services/Prodivers.js` a été surchargé pour permettre de créer un User lors d'une connexion via un provider (Auth0 par exemple).

<details>
  <summary>Détails de la surcharge</summary>

  Dans la méthode `connect`, dans le callback envoyé en paramètre à l'appel de `getProfile`, ajouter le code suivant juste avant le `return` (ligne 92):

  ```js
  const [createdUser, errorCreate] = await strapi
    .plugins['coog-plugin']
    .services
    .user
    .create(params);

  if (errorCreate) {
    return reject([null, errorCreate]);
  }
  ```
</details>

# Configuration et utilisation

## Interface d’administration

L’interface d'administration du plugin se trouve dans l'onglet Settings puis Coog Connector.

Elle se compose en deux parties, la première partie permet de configurer le plugin avec l'URL de Gateway et Token d'accès.
La deuxième partie permet de tester la configuration afin de valider le fonctionnement.

![image](https://user-images.githubusercontent.com/60874847/206681662-fec1ed25-2e12-46bd-a846-4a489976c417.png)
