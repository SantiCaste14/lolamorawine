# --- Etapa 1: compilar el sitio ---
FROM node:22-alpine AS build
WORKDIR /app

# Instalar dependencias con el lockfile para builds reproducibles
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG SITE_URL=https://www.lolamorawine.com.ar
ARG BASE_PATH=/
ENV SITE_URL=$SITE_URL BASE_PATH=$BASE_PATH
RUN npm run build && npm run validar

# --- Etapa 2: servir estáticos ---
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# No correr como root
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx \
 && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
