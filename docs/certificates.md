## Gestion des certificats Let's Encrypt (Docker Compose)

1) Initialiser un certificat (run once)

Éditez `docker-compose.prod.yml` pour vérifier `DOMAIN` et `EMAIL` dans les services si nécessaire, puis exécutez depuis la racine du dépôt sur le serveur:

```sh
docker-compose -f docker-compose.prod.yml up -d nginx certbot
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot -w /var/www/certbot \
  -d theotime.pagies.lille.mds-project.fr -d www.theotime.pagies.lille.mds-project.fr \
  --email admin@theotime.pagies.lille.mds-project.fr --agree-tos --no-eff-email
docker-compose -f docker-compose.prod.yml exec nginx nginx -t && docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

2) Automatiser le renouvellement


3) Vérifications


4) Renouvellement automatique dans Docker

Le service `certbot-renewer` :


Pré-requis:

Sécurité:

```sh
docker-compose -f docker-compose.prod.yml logs -f certbot-renewer
```
Pré-requis:
