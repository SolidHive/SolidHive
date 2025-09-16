# Sauvegarde et Restauration de la Base de Données

Le projet contient un dossier `db` structuré comme suit :

```
db/
├── dump.sql         # Dump initial de la base de données
├── backups/         # Dossier contenant les sauvegardes de la base de données
└── script/
    ├── backup-db.ps1  # Script PowerShell pour sauvegarder la base de données
    └── restore-db.ps1 # Script PowerShell pour restaurer la base de données
```

## Exécuter une sauvegarde de la base de données

Le script `backup-db.ps1` permet de créer une sauvegarde et de mettre à jour `dump.sql`. Pour l'exécuter, utilisez :
```powershell
.\db\script\backup-db.ps1
```

Ce script :
1. Crée un dossier `db/backups/` s'il n'existe pas.
2. Génère un dump de la base de données `solidhive` et le stocke dans `db/backups/` avec un horodatage.
3. Met à jour `db/dump.sql` avec la dernière sauvegarde.

## Restaurer la base de données

Pour restaurer la base de données à partir du fichier `dump.sql`, exécutez :
```powershell
.\db\script\restore-db.ps1
```

Ce script restaure l'état de la base de données à partir du fichier `dump.sql`. Vous pourriez voir des erreurs concernant des objets déjà existants, ce qui est normal si certaines structures existent déjà dans la base.

## Arrêter les conteneurs
```sh
docker compose down
```

## Nettoyer les volumes (supprime les données persistantes !)
```sh
docker compose down -v
```