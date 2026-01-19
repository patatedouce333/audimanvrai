# Analyse Technique de la Structure du Projet

## Objectif
Ce document décrit de manière factuelle le squelette du projet, chaque fichier existant, son rôle, et les connexions observées entre eux. Il sert de plan de l'existant pour guider les développements futurs.

---

## 1. Arborescence Complète

```
.
├── .dockerignore
├── .gitignore
├── Dockerfile
├── README_WINDOWS.md
├── README.md
├── firebase.json
├── package.json
└── .idx/
    └── mcp.json
```

---

## 2. Analyse Détaillée des Fichiers et Connexions

### Fichier : `package.json`

*   **Rôle** : Fichier de manifeste standard pour un projet Node.js. Il définit le nom du projet, sa version, ses dépendances et le point d'entrée de l'application.
*   **Connexions / Références** :
    *   **Dépendances** : Référence la librairie `express`. Lors d'un `npm install`, il peuple le dossier `node_modules`.
    *   **Point d'entrée** : Désigne `index.js` comme fichier principal (`"main": "index.js"`). **Ce fichier est actuellement manquant.**
    *   **Utilisé par** : `Dockerfile`. Ce fichier est copié et utilisé par la commande `RUN npm install` pour construire l'image Docker.
*   **Contenu brut** :
    ```json
    {
      "name": "audioman-win11",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "echo "Error: no test specified" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "express": "^4.19.2"
      }
    }
    ```

### Fichier : `Dockerfile`

*   **Rôle** : Script pour construire une image Docker de l'application.
*   **Connexions / Références** :
    *   **Base** : Utilise une image de base `node:18`.
    *   **Dépendances** : Copie `package.json` et `package-lock.json` (s'il existe) et exécute `npm install` pour installer les dépendances définies dans `package.json`.
    *   **Code source** : Tente de copier tout le contenu du répertoire courant (`COPY . .`).
    *   **Exposition réseau** : Expose le port `3000`, ce qui indique que l'application attendue est un service réseau (probablement un serveur web Express).
    *   **Démarrage** : Exécute `npm start` comme commande de démarrage. **Cette commande n'est pas définie dans le `package.json`, ce qui fera échouer le démarrage du conteneur.**
*   **Contenu brut** :
    ```dockerfile
    FROM node:18
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3000
    CMD ["npm", "start"]
    ```

### Fichier : `firebase.json`

*   **Rôle** : Fichier de configuration pour les services Firebase, principalement Firebase Hosting.
*   **Connexions / Références** :
    *   **Hosting** : Définit la configuration pour Firebase Hosting.
    *   **Dossier public** : Spécifie que le dossier `public` doit être utilisé comme racine du site web. **Ce dossier est actuellement manquant.**
    *   **Réécriture des URLs** : Configure le service pour fonctionner comme une Single-Page Application (SPA) en redirigeant toutes les routes non trouvées vers `index.html`.
*   **Contenu brut** :
    ```json
    {
      "hosting": {
        "public": "public",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }
    ```

### Fichier : `.idx/mcp.json`

*   **Rôle** : Fichier de configuration spécifique à l'environnement de développement (IDE type Firebase Studio / Project IDX). Il configure les serveurs d'outils ("Model Context Protocol") qui permettent à l'IA de l'IDE d'interagir avec des services externes comme Tavily (recherche) ou Firebase.
*   **Connexions / Références** :
    *   **Outil Tavily** : Définit comment l'IDE doit lancer l'outil de recherche Tavily.
    *   **Clé API (contexte local)**: Fournit une clé `TAVILY_API_KEY` comme variable d'environnement **uniquement au processus de cet outil, dans le contexte local de l'IDE**. Il ne s'agit pas d'un secret de production pour l'application elle-même, mais d'une configuration pour un outil de développement.
*   **Contenu brut** :
    ```json
    {
      "mcpServers": {
        "tavily": {
          "command": "npx",
          "args": [
            "-y",
            "@tavily/mcp@latest"
          ],
          "env": {
            "TAVILY_API_KEY": "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"
          },
          "disabled": false
        },
        "firebase-official": {
          "command": "npx",
          "args": [
            "-y",
            "firebase-tools",
            "mcp"
          ]
        }
      }
    }
    ```

### Autres Fichiers

*   **`.gitignore` / `.dockerignore`** : Fichiers standards pour exclure des fichiers/dossiers (comme `node_modules`) du suivi Git et de la construction de l'image Docker.
*   **`README.md` / `README_WINDOWS.md`** : Fichiers de documentation.

---

## 3. Fichiers et Dossiers Référencés mais Absents

Voici les éléments qui sont référencés dans les fichiers de configuration mais qui n'existent pas encore dans le projet :

*   **`index.js`** :
    *   Référencé dans : `package.json` (comme point d'entrée `main`).
    *   Rôle attendu : Contenir le code principal du serveur Node.js/Express.
*   **`public/` (dossier)** :
    *   Référencé dans : `firebase.json` (comme racine pour Firebase Hosting).
    *   Rôle attendu : Contenir les fichiers statiques du site web (HTML, CSS, JS client).
*   **`public/index.html`** :
    *   Référencé dans : `firebase.json` (comme destination de la réécriture pour la SPA).
    *   Rôle attendu : Fichier HTML principal de l'application front-end.
*   **Script `npm start`** :
    *   Référencé dans : `Dockerfile` (comme commande de démarrage `CMD`).
    *   Rôle attendu : Commande à définir dans la section `scripts` de `package.json` pour lancer l'application (ex: `"start": "node index.js"`).
