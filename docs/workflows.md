# Workflows CI/CD

Le projet SolidHive dispose d'un workflow automatisé de validation et sécurité qui s'exécute sur chaque push/pull request vers les branches `develop` et `main`.

## Workflow: Security & Code Validation

**Fichier:** `.github/workflows/validate.yml`

Ce workflow comprend 5 jobs qui s'exécutent en parallèle :

### 1. 📝 Code Quality & Formatting
- Vérifie le formatage du code (Prettier)
- Exécute les linters (ESLint) sur le backend et frontend

### 2. 🔐 Secrets Detection (Gitleaks)
- Scanne l'historique Git pour détecter des secrets exposés
- Détecte : clés API, tokens JWT, chaînes de connexion DB, credentials OAuth
- Configuration : `.gitleaks.toml`

### 3. 🛡️ SAST Analysis (CodeQL)
- Analyse statique du code JavaScript/TypeScript
- Détecte : injections SQL, XSS, path traversal, command injection, etc.
- Mode : `security-extended` pour une analyse approfondie
- Résultats visibles dans l'onglet **Security > Code scanning** de GitHub

### 4. 📦 Dependency Security Scan
- **npm audit** : Vérifie les vulnérabilités des packages (backend + frontend)
- **Snyk** : Analyse approfondie (nécessite un token `SNYK_TOKEN` dans les secrets GitHub)
- Seuil : Moderate+ (npm audit), High+ (Snyk)

### 5. 🏗️ Build Validation
- Compile le backend (NestJS)
- Compile le frontend (Vue + Vite)
- Sauvegarde les artifacts de build (7 jours)

## Configuration requise

### Optionnel : Token Snyk
Pour activer l'analyse Snyk :
1. Créer un compte sur [snyk.io](https://snyk.io)
2. Générer un token API dans Account Settings
3. Ajouter le token dans GitHub : `Settings > Secrets and variables > Actions > New secret`
   - Nom : `SNYK_TOKEN`
   - Valeur : votre token Snyk

## Dependabot

**Fichier:** `.github/dependabot.yml`

Dependabot vérifie automatiquement les mises à jour de dépendances chaque lundi :
- Packages npm (backend, frontend, root)
- GitHub Actions
- Images Docker

Les mises à jour de sécurité sont automatiquement proposées via des Pull Requests.

## Résultats

### Où voir les résultats ?

| Vérification | Localisation |
|--------------|--------------|
| **Workflow complet** | GitHub > Actions |
| **CodeQL** | GitHub > Security > Code scanning |
| **Gitleaks** | GitHub > Actions > Logs du workflow |
| **npm audit** | GitHub > Actions > Logs du workflow |
| **Snyk** | [snyk.io](https://snyk.io) dashboard |
| **Builds** | GitHub > Actions > Artifacts |
