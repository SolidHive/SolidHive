# Gestion des versions

Ce projet suit la convention [Conventional Commits](https://www.conventionalcommits.org/) pour faciliter la gestion des versions et la génération automatisée des changelogs. Consultez le [CHANGELOG](../CHANGELOG.md) pour voir l'historique des modifications.

## Types de commits utilisés

- `feat`: Nouvelles fonctionnalités
- `fix`: Corrections de bugs
- `docs`: Modifications de la documentation
- `style`: Changements de formatage
- `refactor`: Refactorisation du code
- `test`: Ajout ou modification de tests
- `chore`: Modifications du build, outils, etc.

## Gestion automatisée des versions avec Release Please

Ce projet utilise [Release Please](https://github.com/googleapis/release-please) pour automatiser la gestion des versions et la génération des changelogs basées sur les commits conventionnels.

### Création de commits conventionnels

Structurez vos messages de commit selon la convention:

```
type(scope): message
```

Exemple: `feat(api): ajouter l'endpoint pour trier les messages`

Les types de commits déterminent automatiquement l'incrémentation de version:

- **fix**: → incrémente la version PATCH (1.0.0 → 1.0.1)

```
fix(api): corriger la validation des champs vides

Le serveur acceptait des messages avec des pseudos vides,
ce qui causait des problèmes d'affichage.
```

- **feat**: → incrémente la version MINOR (1.0.0 → 1.1.0)

```
feat(thread): ajouter la pagination des messages

Implémente une pagination avec 5 messages par page pour
améliorer les performances et l'expérience utilisateur.
```

- **feat** avec **BREAKING CHANGE**: dans le corps → incrémente la version MAJOR (1.0.0 → 2.0.0)

```
feat(api): refondre l'API des messages

BREAKING CHANGE: La structure de l'API a été modifiée.
- GET /api/messages retourne maintenant un objet avec pagination
- Les champs 'author' sont renommés en 'pseudo'
- Format de date modifié de ISO à timestamp
```

- Autres types (docs, style, refactor, etc.) → n'incrémentent pas la version

## Processus de release automatisé

1. Quand vous poussez des commits sur la branche main, Release Please analyse les commits depuis la dernière release.

2. Si des commits significatifs sont détectés (fix, feat ou BREAKING CHANGE), Release Please:

   - Crée automatiquement une pull request qui:
     - Met à jour la version dans package.json
     - Met à jour le CHANGELOG.md
     - Prépare les autres fichiers nécessaires

3. Pour finaliser la release:
   - Examinez et approuvez la pull request
   - Fusionnez-la dans la branche main
   - Release Please créera automatiquement:
     - Un tag Git pour la nouvelle version
     - Une release GitHub avec les notes de changements
     - Déclenchera le workflow de déploiement

## Forcer manuellement une release

Dans de rares cas où vous devriez forcer manuellement une release, vous pouvez:

1. Créer une pull request manuelle qui:
   - Met à jour la version dans package.json
   - Met à jour le CHANGELOG.md

2. Une fois fusionnée, créez une release GitHub manuelle:
   - Accédez à la page "Releases" sur GitHub
   - Cliquez sur "Draft a new release"
   - Entrez le tag pour la version (par exemple v1.1.0)
   - Remplissez les notes de changements
   - Publiez la release