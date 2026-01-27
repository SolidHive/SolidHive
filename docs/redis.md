# Redis - Cache et Sessions

## Qu'est-ce que Redis ?

Redis (Remote Dictionary Server) est une base de données en mémoire open-source qui fonctionne comme un cache et un store de données clé-valeur. Dans SolidHive, Redis est utilisé pour :

- **Cache des données utilisateur** : Accélérer les requêtes de profils utilisateur
- **Gestion des sessions** : Persister les sessions utilisateur entre les redémarrages
- **Performance** : Réduire la charge sur PostgreSQL

## Configuration dans SolidHive

### Variables d'environnement

Dans `server/.env` :
```env
# Configuration Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=solidhive-redis-password-2026
REDIS_HOST=redis
REDIS_PORT=6379
```

### Docker Compose

```yaml
redis:
  container_name: solidhive-redis-1
  image: redis:7-alpine
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes --requirepass solidhive-redis-password-2026
  volumes:
    - redis_data:/data
  restart: unless-stopped
```

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AuthService   │────│  RedisService   │────│     Redis      │
│                 │    │   (générique)   │    │   (cache)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Sessions       │
                    │  (connect-redis)│
                    └─────────────────┘
```

## Commandes Utiles

### Connexion à Redis

```bash
# Se connecter au conteneur Redis
docker compose exec redis redis-cli

# Avec mot de passe
docker compose exec redis redis-cli --pass solidhive-redis-password-2026
```

### Commandes de Base

```bash
# Lister toutes les clés stockées
KEYS "*"

# Récupérer la valeur d'une clé
GET "user:profile:123"

# Stocker une valeur avec expiration (300 secondes)
SET "user:profile:123" "data" EX 300

# Supprimer une clé
DEL "user:profile:123"

# Voir le temps restant avant expiration (-1 = pas d'expiration)
TTL "user:profile:123"
```

### Monitoring en Temps Réel

```bash
# Surveiller toutes les opérations Redis
docker compose exec redis redis-cli --pass solidhive-redis-password-2026 monitor
```

### Informations Système

```bash
# Informations générales sur Redis
INFO

# Statistiques de commandes
INFO commandstats

# Informations sur la mémoire
INFO memory
```

## Fonctionnalités Utilisées dans SolidHive

### 1. Cache des Profils Utilisateur

**Clé** : `user:profile:{userId}`
**TTL** : 300 secondes (5 minutes)
**Usage** : Évite les requêtes répétées à PostgreSQL pour les données de profil

```typescript
// Dans AuthService.getProfile()
const cacheKey = `user:profile:${userId}`;
const cachedProfile = await this.redisService.get(cacheKey);
if (cachedProfile) {
  return cachedProfile; // Retour rapide depuis le cache
}
// ... sinon récupération depuis DB et mise en cache
```

### 2. Sessions Utilisateur

**Préfixe** : `solidhive:sess:`
**TTL** : 3600 secondes (1 heure)
**Usage** : Persiste les sessions entre les redémarrages du serveur

```typescript
// Configuration dans main.ts
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'solidhive:sess:',
  ttl: 3600,
});
```

### 3. Invalidation Automatique du Cache

**Usage** : Suppression automatique du cache quand les données utilisateur changent

```typescript
// Dans UsersService.updateUser()
const updatedUser = await this.usersRepository.save(user);

// Invalider automatiquement le cache Redis
const cacheKey = `user:profile:${userId}`;
await this.redisService.del(cacheKey);

return updatedUser;
```

**Résultat** : Les modifications sont immédiatement visibles sans attendre l'expiration du cache

## Debugging et Monitoring

### Vérifier que Redis fonctionne

```bash
# Vérifier que le conteneur tourne
docker compose ps redis

# Tester la connexion
docker compose exec redis redis-cli --pass solidhive-redis-password-2026 ping

# Voir les clés actuelles
docker compose exec redis redis-cli --pass solidhive-redis-password-2026 keys "*"

# Inspecter une clé de cache
docker compose exec redis redis-cli --pass solidhive-redis-password-2026 get "user:profile:ID"
```

### Logs Redis

```bash
# Voir les logs du conteneur Redis
docker compose logs redis

# Suivre les logs en temps réel
docker compose logs redis -f
```

### Métriques de Performance

```bash
# Statistiques d'utilisation
docker compose exec redis redis-cli --pass solidhive-redis-password-2026 info stats

# Métriques de mémoire
docker compose exec redis redis-cli --pass solidhive-redis-password-2026 info memory
```

## Workflow Complet avec Cache

### Mise à Jour d'un Profil Utilisateur
```
Frontend → Mise à jour BDD → Invalidation cache → Reconstruction cache → Données à jour
```

### Lecture d'un Profil Utilisateur
```
Frontend → Vérification cache → Cache HIT (retour immédiat) ou MISS (requête BDD + cache)
```

### Avantages du Cache Intelligent
- **Performance** : Réduction drastique des requêtes BDD
- **Cohérence** : Données toujours à jour après modification
- **Résilience** : Service dégradé gracieusement si Redis down

## Bonnes Pratiques

### 1. Invalidation Automatique
**Principe** : Toujours invalider le cache après modification des données

```typescript
// ✅ BON : Invalidation automatique
async updateUser(userId: string, data: UpdateUserDto) {
  const user = await this.usersRepository.save(data);
  await this.redisService.del(`user:profile:${userId}`);
  return user;
}
```

### 2. Clés de Cache
- Préfixes cohérents : `user:profile:`, `session:`, etc.
- TTL approprié : 5 minutes pour les profils, 1h pour les sessions
- **UUID complets** : Éviter les collisions
- **TTL approprié** : 5 minutes pour les profils, 1h pour les sessions

### 2. Gestion des Erreurs

```typescript
async get<T>(key: string): Promise<T | null> {
  try {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis error for key ${key}:`, error);
    return null; // Graceful degradation
  }
}
```

### 3. Sérialisation

- **JSON** pour les objets complexes
- **Gestion des erreurs** de parsing
- **Types TypeScript** pour la sécurité

### 4. Sécurité

- **Mot de passe fort** en production
- **Réseau isolé** (pas d'exposition externe)
- **Chiffrement** si données sensibles

## Dépannage

### Erreur "NOAUTH Authentication required"
**Cause** : Mot de passe manquant ou incorrect
**Solution** : Vérifier le mot de passe dans `.env` et la configuration Docker

### Erreur "Connection refused"
**Cause** : Redis ne tourne pas
**Solution** : `docker compose restart redis`

### Cache qui ne se met pas à jour
**Cause** : TTL trop long ou invalidation manquante
**Solution** : Vérifier que l'invalidation est appelée après les mises à jour

### Mémoire pleine
**Cause** : Trop de données en cache
**Solution** : `FLUSHDB` ou ajuster la politique d'éviction

# Ajuster la politique d'éviction dans redis.conf
# maxmemory-policy: allkeys-lru
```

## Migration vers Redis en Production

### 1. Changer le mot de passe

```env
# Dans .env
REDIS_PASSWORD=votre-mot-de-passe-production-super-securise
```

```yaml
# Dans docker-compose.yml
command: redis-server --appendonly yes --requirepass votre-mot-de-passe-production-super-securise
```

### 2. Configurer la persistance

```yaml
redis:
  command: >
    redis-server
    --appendonly yes
    --save 60 1000
    --requirepass votre-mot-de-passe
  volumes:
    - redis_data:/data
```

### 3. Monitoring
- Redis Insight pour l'administration visuelle
- Prometheus + Grafana pour les métriques
- Alertes sur la mémoire et les connexions

---