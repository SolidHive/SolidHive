# Installation du projet

## Prérequis
Avant de commencer, assurez-vous d'avoir installé :

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation et Lancement du Projet

1. **Cloner le projet** :
   ```sh
   git clone https://github.com/votre-repo/solidhive.git
   cd solidhive
   ```

2. **Créer un fichier `.env` pour le backend** (si non existant) :
   ```sh
   cp server/.env.example server/.env
   ```
   Modifiez les variables d'environnement si nécessaire. Le fichier devrait contenir :
   ```
   DB_HOST=db
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=solidhive
   COOKIE_SECURE=false
   ```

3. **Lancer l'application avec Docker Compose** :
   ```sh
   docker compose up --watch
   ```
   Cette commande va :
   - Construire et démarrer les conteneurs (`frontend`, `backend`, `db`, `pgadmin`).
   - Synchroniser automatiquement les modifications dans `client/src` et `server/src`.
   - Recompiler le projet si `package.json` est modifié.

## Explication du `docker-compose.yml`

### Services

- **frontend** :
  - Construit à partir du dossier `client` avec `Dockerfile`.
  - Exposé sur le port `5173`.
  - Synchronisation des fichiers source pour un développement fluide.
  - Se reconstruit si `package.json` change.
  - Dépend du `backend`.

- **backend** :
  - Construit à partir du dossier `server` avec `Dockerfile`.
  - Exposé sur le port `3001` (mappé sur `3000` dans le conteneur).
  - Charge les variables d'environnement depuis `.env`.
  - Synchronisation des fichiers source et reconstruction si `package.json` change.
  - Dépend de la base de données `db`.

- **db (PostgreSQL 16)** :
  - Conteneur nommé `solidhive-db-1`.
  - Base de données `solidhive` créée au démarrage.
  - Exposé sur le port `5432`.
  - Stocke les données dans un volume nommé `db_data`.
  - Intègre une vérification de santé (healthcheck).

- **pgadmin** :
  - Interface web pour gérer la base de données PostgreSQL.
  - Exposé sur le port `8080`.
  - Email de connexion : `admin@admin.com`
  - Mot de passe : `admin`
  - Connecté à `db`.

- **mailtrap** :
  - Service de capture d'emails pour les tests de développement.
  - Interface web exposée sur le port `1080`.
  - Serveur SMTP exposé sur le port `1025`.
  - Identifiant et mot de passe pour l'interface web : `mailtrap`
  - Capture tous les emails envoyés par l'application sans les transmettre aux destinataires réels.
  - Permet de visualiser et tester les templates d'emails dans un environnement sécurisé.
  - Utilisé par le backend pour simuler l'envoi d'emails (réinitialisation de mot de passe, confirmations, etc.).

### Volumes
- `db_data` : Stocke les données PostgreSQL de manière persistante.
- `pgadmin_data` : Stocke la configuration et les données de pgAdmin.