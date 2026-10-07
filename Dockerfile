# Landing estatica VJ Tech -> nginx en Docker
# Puerto interno: 80 (solo se expone en la red interna de docker compose;
# el puerto 80 del host lo publica el reverse proxy en sitios-deploy-vjtech)
FROM nginx:1.27-alpine

# Sitio
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY app.js /usr/share/nginx/html/app.js
COPY legal.js /usr/share/nginx/html/legal.js
COPY terminos.html /usr/share/nginx/html/terminos.html
COPY privacidad.html /usr/share/nginx/html/privacidad.html
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY logo.png /usr/share/nginx/html/logo.png
COPY logoBack.png /usr/share/nginx/html/logoBack.png
COPY imgs /usr/share/nginx/html/imgs
COPY manifest.json /usr/share/nginx/html/manifest.json
COPY apple-touch-icon.png /usr/share/nginx/html/apple-touch-icon.png
COPY icons /usr/share/nginx/html/icons

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
