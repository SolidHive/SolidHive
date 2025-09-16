# Gestion des Dépendances

Si vous souhaitez ajouter un nouveau package, utilisez les commandes suivantes :

### Ajouter un package au frontend :
```sh
docker compose exec frontend npm install <nom_du_package>
```

### Ajouter un package au backend :
```sh
docker compose exec backend npm install <nom_du_package>
```

## Installation complète des dépendances

### Approche entièrement conteneurisée (recommandée)

Avec notre configuration Docker, il **n'est pas nécessaire** d'installer les dépendances en local. 
Docker s'occupe d'installer et gérer toutes les dépendances à l'intérieur des conteneurs.

Pour démarrer le projet sans aucune installation locale (hormis Docker) :
```sh
docker compose up --watch
```

### Installation locale des dépendances (optionnel)

Si vous souhaitez avoir les dépendances en local (pour l'autocomplétion dans votre IDE par exemple) :

**Frontend** :
```sh
cd client
npm install
```

**Backend** :
```sh
cd server
npm install
```

**Important** : L'installation locale des dépendances est purement optionnelle et ne change pas le fonctionnement de l'application dans les conteneurs Docker.

**Note importante sur les dépendances locales** : Si vous installez des packages localement et que vous utilisez VSCode ou un autre IDE, vous pourriez rencontrer des incohérences entre votre environnement de développement local et l'environnement Docker. Par exemple :

- Des erreurs de linting ou d'intellisense dans VSCode pour des modules qui fonctionnent parfaitement dans Docker
- Des différences de comportement entre l'exécution locale et l'exécution dans Docker
- Des modules qui fonctionnent dans un environnement mais pas dans l'autre en raison de différences de système d'exploitation

En cas de divergence, considérez l'environnement Docker comme la référence, puisque c'est là que votre application s'exécute réellement. Si nécessaire, vous pouvez synchroniser manuellement les package.json et package-lock.json entre les environnements.

### Comment les dépendances sont-elles gérées ?

Notre configuration Docker :

1. **Lors de la construction des images** :
   - Docker exécute `npm install` dans les conteneurs en se basant sur les fichiers `package.json`
   - Les dépendances sont installées dans les conteneurs, pas sur votre machine

2. **Lors du développement** :
   - Si vous modifiez un `package.json`, Docker reconstruira automatiquement le conteneur correspondant
   - Les commandes comme `docker compose exec backend npm install <package>` installent les packages dans le conteneur

3. **Le fichier `package-lock.json`** :
   - Est généré/mis à jour dans les conteneurs
   - Peut être différent de celui généré localement en raison des différences d'environnement (Linux dans Docker vs Windows/Mac en local)
   - C'est le fichier dans le conteneur qui fait autorité pour l'exécution