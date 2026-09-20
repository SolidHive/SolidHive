# Déploiement gratuit : Render + Neon

Hébergement sans carte bancaire, à partir du `render.yaml` à la racine du dépôt.

| Brique                 | Où                                         | Gratuit                                  |
| ---------------------- | ------------------------------------------ | ---------------------------------------- |
| API NestJS + PDF       | Render, web service Docker `solidhive-api` | 512 Mo, veille après 15 min sans requête |
| Sessions et cache      | Render Key Value `solidhive-redis`         | 25 Mo, réseau privé                      |
| Client Vue             | Render static site `solidhive`             | illimité, ne dort jamais                 |
| PostgreSQL             | Neon                                       | 0,5 Go, réveil automatique               |
| Fichiers (images, PDF) | Neon Object Storage, compatible S3         | 5 Go par projet                          |
| Emails                 | Brevo, par API HTTP (SMTP bloqué)          | 300 par jour                             |
| Paiements              | Stripe en mode test                        | aucun vrai paiement                      |

Le client réécrit `/api/*` et `/files/*` vers l'API : tout reste sur
une seule origine, le cookie de session est first-party et le CORS ne joue pas.

## 1. Neon

1. Créer un projet sur [neon.tech](https://neon.tech), région Frankfurt, base `solidhive`.
2. Copier la chaîne de connexion **pooled** (`...-pooler...neon.tech/solidhive?sslmode=require`).
3. Onglet **Object storage** de la branche → **New bucket**, nom `solidhive`, accès
   `private` : les fichiers passent par l'API, qui vérifie les droits.
4. Barre latérale **Credentials** → **Create credential**, scopes `storage:read` et
   `storage:write`. Neon affiche une seule fois `AWS_ENDPOINT_URL_S3`,
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` et `AWS_REGION` : les copier.

## 2. Emails : particularité de Render

Les web services gratuits de Render bloquent le trafic sortant vers les ports
SMTP 25, 465 et 587 (changelog Render, septembre 2025). Nodemailer y échoue sur
`Connection timeout` quel que soit le serveur : Brevo SMTP, Gmail, Mailjet.

Le projet garde son envoi SMTP partout (local avec Mailtrap, docker-compose,
VPS). Sur Render seulement, `EMAIL_TRANSPORT=brevo-api` bascule l'envoi sur
l'API HTTPS de Brevo (`server/src/common/utils/email/brevo-api.transport.ts`),
avec le même contenu et les mêmes pièces jointes.

Dans Brevo : menu **SMTP & API** → onglet **Clés API** → **Générer une nouvelle
clé API**. C'est cette clé (`xkeysib-…`), pas la clé SMTP, qui va dans
`BREVO_API_KEY`. `EMAIL_FROM` doit être une adresse validée dans **Expéditeurs**.

## 3. Render

1. Dashboard → **New** → **Blueprint** → choisir le dépôt `SolidHive/SolidHive`,
   branche `develop`. Render lit `render.yaml` et propose les trois services.
2. Renseigner les variables marquées `sync: false` : `DATABASE_URL` (Neon), les trois
   `AWS_*` du stockage objet (et vérifier que `AWS_REGION` correspond à l'endpoint),
   `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `BREVO_API_KEY`, `EMAIL_FROM`,
   `EMAIL_SUPPORT`. `SESSION_SECRET` et `JWT_SECRET` sont générés.
3. Lancer. Le premier build de l'API prend 5 à 8 minutes (Chromium + npm).
4. Si Render a suffixé les noms (`solidhive-api-xyz1`), corriger dans le dashboard
   `FRONTEND_URL` de l'API et les destinations des règles de réécriture du site
   statique, puis les reporter dans `render.yaml`.

Au démarrage, le conteneur joue les migrations TypeORM puis lance l'API. Les
données de démonstration se chargent une fois depuis un poste local, avec les mêmes
variables que l'API pour que les images partent dans le bucket :

```bash
cd server && DATABASE_URL='<url Neon>' DB_SSL=true \
  AWS_ENDPOINT_URL_S3=... AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... \
  AWS_REGION=eu-central-1 STORAGE_BUCKET=solidhive npm run seed
```

## 4. Garder l'API éveillée

L'instance gratuite s'endort après 15 minutes sans requête et met 30 à 60 s à
se réveiller. Un moniteur externe qui appelle `/health` toutes les 5 à
10 minutes suffit à l'éviter. Deux options :

- **Uptime Kuma**, open source et auto-hébergé : un conteneur Docker
  (`louislam/uptime-kuma`), un moniteur HTTP sur
  `https://solidhive-api.onrender.com/health` toutes les 5 minutes, et un
  tableau de bord qui affiche disponibilité et temps de réponse. Il doit tourner
  sur une machine allumée en permanence (serveur, NAS, Raspberry Pi) : sur un PC,
  l'API se rendort dès qu'il est éteint.
- **UptimeRobot**, service en ligne gratuit jusqu'à 50 moniteurs à 5 minutes
  d'intervalle : rien à héberger.

L'ancien workflow GitHub Actions a été retiré : GitHub décale ou saute les crons
aux heures chargées et les suspend après 60 jours sans commit, ce qui laissait
l'API s'endormir.

## Limites à connaître

- **Fichiers** : images, factures et billets vivent dans le bucket Neon via
  `server/src/common/storage/storage.ts`. Sans les variables `AWS_*`, l'API retombe
  sur le dossier `uploads/` local, que Render efface à chaque déploiement.
- **PDF** : Chromium tourne en un seul processus dans 512 Mo
  (`server/src/common/utils/chromium.ts`). Un PDF à la fois passe ; en cas de
  redémarrage pour mémoire, remplacer Puppeteer par une bibliothèque légère
  (pdfmake, pdf-lib).
- **Quota** : 750 heures d'instance par mois, une API allumée en continu en
  consomme 744. Ne pas ajouter de second web service gratuit sur le même compte.
