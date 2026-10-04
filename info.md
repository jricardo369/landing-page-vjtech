# Info del proyecto — PaginaLanding (VJTech)

## Cambios aplicados

### 1. Seguridad en la página (sin tocar el estilo)
- `index.html`
  - `meta referrer` + CSP temporal vía meta (mover a headers nginx al desplegar).
  - Formulario con `<label>`, `maxlength`, `autocomplete`, `method="post"`, honeypot anti-spam (`fWeb`).
  - Quitadas pistas internas (`/api/...`) del texto visible y `href="#"` de Privacidad/Términos.
  - `<script src="app.js" defer>`.
- `styles.css`
  - Eliminado `@import` duplicado de Google Fonts (ya viene por `<link>`).
  - Agregadas clases no visuales `.sr-only` y `.hp-wrap`.
- `app.js`
  - `escapeHTML()` en todo render (servicios, proyectos, pasos, FAQ).
  - Formulario: validación (nombre ≥2, email válido, servicio del catálogo, descripción ≥10),
    honeypot silencioso, envío `POST` JSON por HTTPS con timeout 10s.
  - Eliminados: `GET` con PII en URL, `http://dominio` hardcodeado, `localStorage` con email,
    `console.error`. Solo se guarda `{tipo, fecha}` en `sessionStorage`.
  - `onclick` → `addEventListener`; filtros con allowlist.
  - `window.VJTech = { CONFIG, services, sendQuote, ... }` como frontera para futuro
    backend de correos o componentes Angular (las API keys van en backend, nunca en el JS).
  - `CONFIG.ANALYTICS_ID`: poner el ID de GA4 para activar medición (respeta Do Not Track).

### 2. Textos comerciales
- `Copy + diseño` → **Textos que venden** (tarjeta "Landing pages" y plan "Landing").
- `Formulario + WhatsApp` → **Formulario + botón a WhatsApp** (aclara que es botón/enlace,
  no envío de mensajes desde la página).

### 3. SEO básico + Analytics
- Open Graph / Twitter cards + `canonical` en `index.html`.
- `robots.txt` y `sitemap.xml` creados.
- CSP actualizado para permitir GA4 cuando se active.
- `logo.png`: 1.09MB → 198KB (512px, optimizado). Respaldo original en `/tmp/logo-backup.png`.

## Pendientes antes de subir a EC2
1. **Confirmar dominio final.** Se asumió `https://vjtech.mx/` (por `hola@vjtech.mx`) en
   canonical, OG/Twitter y `sitemap.xml`. Si es otro, actualizar esos 3 puntos.
2. **Logo vs marca: resuelto.** El logo (`logo.png`) ya dice "VJTECH LA PIEDAD" y
   toda la página ahora es VJTech — marca consistente.
3. **Backend del formulario.** `CONFIG.API_BASE` está vacío (modo demo, sin red).
   Para producción: `POST https://tu-dominio/api/envio-solicitud` con validación,
   rate-limit y envío de correo/WhatsApp desde el servidor.
4. **HTTPS + headers en nginx** (HSTS, CSP como header, redirect 80→443) al desplegar.
5. **Aviso de privacidad real** (páginas de Privacidad/Términos hoy son texto sin enlace).
   → Hecho parcial: `privacidad.html` creada (LFPDPPP: responsable, datos, finalidades,
   transferencias, ARCO, cookies, seguridad, cambios) con el estilo del sitio
   (ui-ux-pro-max: hero compacto, TOC por anclas, medida de lectura 68ch).
   Enlazada desde el footer y agregada al sitemap con `noindex`.
   Falta: domicilio fiscal del responsable y revisión de un abogado antes de publicar.
- **Términos:** `terminos.html` creada con el mismo patrón (9 secciones: servicios,
  cotizaciones y pagos 50/50, tiempos, obligaciones del cliente, propiedad intelectual,
  cancelaciones, soporte 30 días, responsabilidad, contacto/legislación).
  Enlazada en los 3 footers y en el sitemap con `noindex`.
  Falta: confirmar ciudad de jurisdicción y revisión legal antes de publicar.

## Sección Casos de éxito (ui-ux-pro-max: social proof antes del CTA)
- `index.html`: sección `#casos` después de FAQ (label 06, grid de 4 + CTA a contacto).
- `app.js`: arreglo `casos` (Blackross/Crossfit, IRoda/cycling, LUA Studio/barre,
  Sistema documental) renderizado con `escapeHTML`, expuesto en `window.VJTech`.
- `styles.css`: tarjeta `.case` + slot `.case-logo` ("ESPACIO PARA LOGO").
- Para poner logos: agregar `logo: "imgs/logos/nombre.png"` al caso en `app.js`
  (BlackCross ya usa `imgs/logos/BlackCross.png`; los demás muestran el slot).
