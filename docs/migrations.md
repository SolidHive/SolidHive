# Gestion des migrations avec TypeORM

Le projet utilise TypeORM pour gérer les migrations de base de données, ce qui permet de contrôler les changements de schéma de manière sécurisée et versionnée, particulièrement important en production.

## Configuration des migrations

Pour tous les environnements (développement et production) :

- La synchronisation automatique est désactivée (synchronize: false)
- Toutes les modifications de schéma se font exclusivement via des migrations
- Cette approche garantit une cohérence entre les environnements et un meilleur contrôle des changements

## Commandes pour les migrations

Toutes les commandes liées aux migrations doivent être exécutées dans le conteneur backend :

1. **Créer une migration vide** :

Utile pour les modifications manuelles, les transformations de données ou l'ajout de données initiales (seeding) :

```
docker compose exec backend npm run migration:create --name=NomDeLaMigration
```

2. **Générer une migration basée sur les changements d'entités** :

Après avoir modifié/ajouté des entités, générez une migration qui appliquera ces changements :

```
docker compose exec backend npm run migration:generate --name=NomDeLaMigration
```

3. **Exécuter toutes les migrations en attente** :

```
docker compose exec backend npm run migration:run
```

4. **Annuler la dernière migration appliquée** :

```
docker compose exec backend npm run migration:revert
```

## Structure des migrations

Les migrations sont stockées dans le dossier "migrations" et sont également montées en volume dans Docker pour assurer une synchronisation entre votre environnement local et le conteneur.

Chaque fichier de migration contient deux méthodes :

- up() : Code exécuté lors de l'application de la migration
- down() : Code exécuté lors de l'annulation de la migration (revert)

## Workflow de développement recommandé

1. Modifiez vos entités selon les besoins du développement
2. Générez une migration pour appliquer ces changements :
```
docker compose exec backend npm run migration:generate --name=DescriptionDesChangements
```
3. Examinez le fichier de migration généré pour vous assurer qu'il reflète bien vos intentions
4. Exécutez la migration pour appliquer les changements à votre base de données:
```
docker compose exec backend npm run migration:run
```
5. Committez le fichier de migration avec votre code

## Déploiement en production

Les migrations sont exécutées automatiquement grâce au workflow GitHub Actions sinon vous pouvez exécuter la commande suivante sur votre serveur :

```
cd /chemin/vers/solidhive/server && npm run migration:run
```