# SolidHive - Plateforme de recensement des acteurs associatifs en France

SolidHive est une plateforme numérique dédiée au recensement des acteurs associatifs en France, engagés dans des thématiques variées liées à l'initiative Agir pour demain . Ces thématiques couvrent des domaines tels que l'environnement, l'éducation, la solidarité, la santé, et bien d'autres enjeux sociétaux.Z

## Sommaire
- [Installation](docs/installation.md)
- [Migrations avec TypeORM](docs/migrations.md)
- [Sauvegarde et Restauration de la base de données](docs/sauvegarde-restauration.md)
- [Gestion des Dépendances](docs/gestion-dependances.md)
- [Hooks Git avec Husky](docs/hooks-git.md)

## Accès aux Services

- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend API** : [http://localhost:3001](http://localhost:3001)
- **API Documentation** : [http://localhost:3001/api](http://localhost:3001/api)
- **pgAdmin** : [http://localhost:8080](http://localhost:8080)
  - Email : `admin@admin.com`
  - Mot de passe : `admin`
  
### Connexion à PostgreSQL depuis pgAdmin

1. Après vous être connecté à pgAdmin, cliquez sur "Add New Server"
2. Dans l'onglet "General", donnez un nom au serveur (ex: "SolidHive DB")
3. Dans l'onglet "Connection", entrez les informations suivantes :
   - Host name/address: `db`
   - Port: `5432`
   - Maintenance database: `solidhive`
   - Username: `postgres`
   - Password: `postgres`
4. Cliquez sur "Save"