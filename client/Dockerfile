ARG TARGET_STAGE=prod-runner


# Étape 1 – Build (optionnel en dev)
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build seulement en production
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi


# Étape 2 – Exécution
# En prod : serveur NGINX
# En dev : serveur Vite/Nuxt/etc.

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# Base NGINX pour prod
FROM nginx:alpine AS prod-runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Image finale conditionnelle
FROM ${TARGET_STAGE}