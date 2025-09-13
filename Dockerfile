# Étape 1 : Construction de l'application React avec Vite
FROM node:22-alpine AS build

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
RUN VITE_API_URL=${VITE_API_URL} npm run build

# Étape 2 : Servir l'application avec Nginx
FROM nginx:alpine

# Création de la configuration Nginx directement dans le Dockerfile
# Utilisation de printf pour une meilleure gestion des caractères spéciaux et des sauts de ligne
RUN printf "%s\n" \
    "server {" \
    "  listen 80;" \
    "  server_name localhost;" \
    "  location / {" \
    "    root  /usr/share/nginx/html;" \
    "    try_files \$uri \$uri/ /index.html;" \
    "  }" \
    "  location /api/ {" \
    "    # Ici, on passe à l'adresse du service backend et on conserve le reste du chemin" \
    "    proxy_pass http://backend:3001/;" \
    "    proxy_set_header Host \$host;" \
    "    proxy_set_header X-Real-IP \$remote_addr;" \
    "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;" \
    "    proxy_set_header X-Forwarded-Proto \$scheme;" \
    "  }" \
    "}" > /etc/nginx/conf.d/default.conf
# Copier le contenu construit du front-end
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]