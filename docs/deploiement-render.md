# Déploiement gratuit : Render + Neon

Hébergement sans carte bancaire, à partir du `render.yaml` à la racine du dépôt.

| Brique              | Où                                     | Gratuit                                      |
| ------------------- | -------------------------------------- | -------------------------------------------- |
| API NestJS + PDF    | Render, web service Docker `solidhive-api` | 512 Mo, veille après 15 min sans requête |
| Sessions et cache   | Render Key Value `solidhive-redis`     | 25 Mo, réseau privé                          |
| Client Vue          | Render static site `solidhive`         | illimité, ne dort jamais                     |
| PostgreSQL          | Neon                                   | 0,5 Go, réveil automatique                   |
| Emails              | Brevo (SMTP)                           | 300 par jour                                 |
| Paiements           | Stripe en mode test                    | aucun vrai paiement                          |

Le client réécrit `/api/*`, `/files/*` et `/uploads/*` vers l'API : tout reste sur
une seule origine, le cookie de session est first-party et le CORS ne joue pas.

## 1. Neon

1. Créer un projet sur [neon.tech](https://neon.tech), région Frankfurt, base `solidhive`.
2. Copier la chaîne de connexion **pooled** (`...-pooler...neon.tech/solidhive?sslmode=require`).

## 2. Brevo

Créer une clé SMTP dans Brevo : le login SMTP devient `EMAIL_USER`, la clé
`EMAIL_PASS`. `EMAIL_FROM` doit être une adresse validée dans Brevo.

## 3. Render

1. Dashboard → **New** → **Blueprint** → choisir le dépôt `SolidHive/SolidHive`,
   branche `develop`. Render lit `render.yaml` et propose les trois services.
2. Renseigner les variables marquées `sync: false` : `DATABASE_URL` (Neon),
   `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `EMAIL_USER`, `EMAIL_PASS`,
   `EMAIL_FROM`, `EMAIL_SUPPORT`. `SESSION_SECRET` et `JWT_SECRET` sont générés.
3. Lancer. Le premier build de l'API prend 5 à 8 minutes (Chromium + npm).
4. Si Render a suffixé les noms (`solidhive-api-xyz1`), corriger dans le dashboard
   `FRONTEND_URL` de l'API et les destinations des règles de réécriture du site
   statique, puis les reporter dans `render.yaml`.

Au démarrage, le conteneur joue les migrations TypeORM puis lance l'API. Les
données de démonstration se chargent une fois depuis un poste local :

```bash
cd server && DATABASE_URL='<url Neon>' DB_SSL=true npm run seed
```

## 4. Garder l'API éveillée

Le workflow `.github/workflows/keep-alive.yml` appelle `/health` toutes les
10 minutes, ce qui empêche la mise en veille. Si l'URL de l'API n'est pas
`https://solidhive-api.onrender.com`, définir la variable de dépôt `API_URL`
dans GitHub → Settings → Secrets and variables → Actions → Variables.

GitHub suspend les crons après 60 jours sans commit : un lancement manuel du
workflow les relance.

## Limites à connaître

- **Fichiers envoyés** (`uploads/`) : le disque de Render est effacé à chaque
  déploiement et à chaque redémarrage. Les images ajoutées via l'interface
  disparaissent ; celles du seed se rechargent avec le seed. La solution durable
  est un stockage objet (Supabase Storage, 1 Go gratuit sans carte) à la place
  de `diskStorage` dans `server/src/modules/files/file-storage.ts`.
- **PDF** : Chromium tourne en un seul processus dans 512 Mo
  (`server/src/common/utils/chromium.ts`). Un PDF à la fois passe ; en cas de
  redémarrage pour mémoire, remplacer Puppeteer par une bibliothèque légère
  (pdfmake, pdf-lib).
- **Quota** : 750 heures d'instance par mois, une API allumée en continu en
  consomme 744. Ne pas ajouter de second web service gratuit sur le même compte.
