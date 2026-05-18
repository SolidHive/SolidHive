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

- Option hôte (cron/systemd) : ajouter une tâche cron qui exécute `certbot renew` et recharge Nginx.
- Option conteneurisée (fourni ici) : le service `certbot-renewer` dans `docker-compose.prod.yml` exécute périodiquement `certbot renew` et demande le reload de Nginx via le socket Docker.

3) Vérifications

- Lister certificats: `docker-compose -f docker-compose.prod.yml run --rm certbot certificates`
- Tester renouvellement: `docker-compose -f docker-compose.prod.yml run --rm certbot renew --dry-run`
- Vérifier Nginx: `docker-compose -f docker-compose.prod.yml exec nginx nginx -t`

4) Renouvellement automatique dans Docker

Le service `certbot-renewer` (si activé) :

- monte `/var/run/docker.sock` pour pouvoir envoyer un HUP au conteneur `solidhive-nginx` après renouvellement
- exécute `certbot renew --webroot -w /var/www/certbot` toutes les 12 heures

Pré-requis:
- Le service a besoin d'accéder au socket Docker (`/var/run/docker.sock`) pour reloader le conteneur `solidhive-nginx`.
- Assurez-vous que le nom du conteneur Nginx dans `docker-compose.prod.yml` est `solidhive-nginx` (c'est le cas par défaut ici).

Sécurité:
- Monter le socket Docker dans un conteneur donne des droits étendus sur l'hôte; si cela pose problème, utilisez la solution cron côté hôte.
