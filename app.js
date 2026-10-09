// VJTech — servicios + menú con scroll suave y activo (ui-ux-pro-max: smooth scroll, sticky nav, keyboard nav)
// Seguridad: datos estáticos escapados, validación de formulario, envío POST HTTPS,
// sin PII en URL ni en storage, honeypot anti-spam. Estructura modular lista para
// futura lógica de correos / migración a Angular (ver window.VJTech al final).
'use strict';

/* ============ Splash de carga ============
   Cubre el primer render al abrir desde acceso directo en el móvil (PWA
   standalone) para que no se vea una pantalla en blanco. Se oculta al
   evento load; el CSS lo oculta solo a los 4s si el JS falla. */
(function initSplash() {
  const sp = document.getElementById('splash');
  if (!sp) return;
  const MIN_MS = 450;
  const start = Date.now();
  let hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    sp.classList.add('hide');
    setTimeout(() => sp.remove(), 500);
  }
  function onReady() { setTimeout(hide, Math.max(0, MIN_MS - (Date.now() - start))); }
  if (document.readyState === 'complete') onReady();
  else addEventListener('load', onReady);
  setTimeout(hide, 4000); // red de seguridad: nunca dejar el splash trabado
})();

/* ============ Config (futuro backend / correos) ============
   API_BASE: '' = modo demo (no hay red, no sale PII del navegador).
   Para activar envío real: https://tu-dominio (HTTPS) y ENDPOINT.
   Nunca pongas aquí API keys SMTP: el correo se envía desde el backend. */
const CONFIG = {
  API_BASE: '',
  ENDPOINT: '/api/envio-solicitud',
  TIMEOUT_MS: 10000,
  MAX: { nombre: 100, correo: 254, descripcion: 2000 },
  /* Analytics GA4: pon tu ID (ej. 'G-XXXXXXX') para activar la medición. '' = desactivado. */
  ANALYTICS_ID: '',
};

/* Carga GA4 solo si hay ID (respeta Do Not Track del navegador) */
(function initAnalytics() {
  if (!CONFIG.ANALYTICS_ID) return;
  if (navigator.doNotTrack === '1') return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ANALYTICS_ID)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', CONFIG.ANALYTICS_ID);
})();

/* ============ Utilidades de seguridad ============ */
function escapeHTML(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
}

/* ============ Datos (exportables a Angular) ============ */
const services = [
  { t: "Páginas web", d: "Sitios institucionales rápidos y optimizados para SEO.", c: "s1", tag: "WEB / 01", pts: ["Diseño a medida", "SEO + Analytics", "Panel administrable"] },
  { t: "Landing pages", d: "Páginas de conversión para campañas y lanzamientos.", c: "s2", tag: "LANDING / 02", pts: ["Textos que venden", "Formulario + botón a WhatsApp", "A/B testing"] },
  { t: "Páginas de presentación", d: "One-page elegantes para portafolio, eventos o personal brand.", c: "s3", tag: "ONE-PAGE / 03", pts: ["Portafolio", "Animaciones suaves", "Deploy en días"] },
  { t: "Apps móviles a medida", d: "Apps híbridas con Ionic: iOS y Android con una sola base de código.", c: "s4", tag: "MOBILE / IONIC 04", pts: ["Ionic + Angular", "Push + login", "Publicación en tiendas"] },
  { t: "Apps web para gestión", d: "Sistemas para citas, inventario, ventas, clientes y más.", c: "s5", tag: "SISTEMA / 05", pts: ["Dashboard + roles", "Base de datos", "Reportes"] },
  { t: "Desarrollo web + APIs", d: "Front en Angular, back y APIs para escalar tu producto.", c: "s6", tag: "FULLSTACK / ANGULAR 06", pts: ["Angular + Node", "API REST", "Cloud deploy"] },
  { t: "Invitaciones virtuales", d: "Invitaciones web sencillas para bodas, XV años, cumpleaños y eventos.", c: "s7", tag: "EXPRESS / 07", pts: ["Diseño temático", "Confirma por WhatsApp", "Lista en 2–4 días"] },
  { t: "Hojas de presentación", d: "Página personal sencilla: quién eres, qué haces y cómo contactarte.", c: "s8", tag: "EXPRESS / 08", pts: ["Perfil + portafolio", "Botones a redes", "Lista en 2–4 días"] },
];

/* Render con escape: misma salida visual, sin XSS si los datos vinieran de API */
document.getElementById('services').innerHTML = services.map((s, i) => `
  <article class="svc" tabindex="0" data-i="${i}"><div class="svc-top ${escapeHTML(s.c)}">${escapeHTML(s.t)}</div>
  <div class="pad"><span class="tag">${escapeHTML(s.tag)}</span><h3>${escapeHTML(s.t)}</h3><p>${escapeHTML(s.d)}</p>
  <ul>${s.pts.map(p => `<li>${escapeHTML(p)}</li>`).join('')}</ul>
  <a href="#contacto" data-scroll data-service="${escapeHTML(s.t)}">Cotizar ${escapeHTML(s.t)} ↗</a></div></article>`).join('');

const projects = [
  { t: "Landing inmobiliaria", m: "WEB · CONVERSIÓN 3.2%", type: "web" },
  { t: "App citas barbería", m: "MOBILE · IONIC", type: "mobile" },
  { t: "ERP taller mecánico", m: "SISTEMA · INVENTARIO + VENTAS", type: "sistema" },
  { t: "Web restaurante + reservas", m: "WEB · RESERVAS", type: "web" },
  { t: "App delivery local", m: "MOBILE · IONIC + GPS", type: "mobile" },
  { t: "Dashboard ventas", m: "SISTEMA · REPORTES", type: "sistema" },
  { t: "Invitación boda digital", m: "WEB · EXPRESS 2–4 DÍAS", type: "web" },
  { t: "Hoja de presentación personal", m: "WEB · PERFIL + CONTACTO", type: "web" },
];
const ALLOWED_FILTERS = new Set(['all', 'web', 'mobile', 'sistema']);
let filter = 'all';
function renderProjects() {
  const list = projects.filter(p => filter === 'all' || p.type === filter);
  document.getElementById('projects').innerHTML = list.map(p => `
    <div class="proj" tabindex="0"><span class="tag">${escapeHTML(p.type.toUpperCase())}</span>
    <h4>${escapeHTML(p.t)}</h4><p class="meta">${escapeHTML(p.m)}</p>
    <a href="#contacto" data-scroll>Quiero algo así ↗</a></div>`).join('');
  bindScrollLinks();
}
renderProjects();
document.querySelectorAll('.chip').forEach(b => {
  b.addEventListener('click', () => {
    const f = b.dataset.f;
    if (!ALLOWED_FILTERS.has(f)) return;
    document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); filter = f; renderProjects();
  });
});

document.getElementById('steps').innerHTML = [
  ["01", "Descubrimiento", "Llamada de 30 min, alcance y cotización clara."],
  ["02", "Diseño", "Prototipo en 3-5 días, 2 rondas de ajustes."],
  ["03", "Desarrollo", "Entregas semanales, código limpio y testeado."],
  ["04", "Deploy + soporte", "Publicamos, medimos y acompañamos."],
].map(s => `<div class="step"><strong>${escapeHTML(s[0])}</strong><h3>${escapeHTML(s[1])}</h3><p class="muted small">${escapeHTML(s[2])}</p></div>`).join('');

// Contacto: lista de servicios + detalle
let activeService = 1;
function renderServiceList() {
  document.getElementById('servicesList').innerHTML = `<h3>Elige un servicio</h3>` + services.map((s, i) =>
    `<button type="button" class="${i === activeService ? 'active' : ''}" data-i="${i}">$0${i + 1} · ${escapeHTML(s.t)}</button>`).join('');
  document.querySelectorAll('#servicesList button').forEach(b => {
    b.addEventListener('click', () => {
      const idx = Number(b.dataset.i);
      if (!Number.isInteger(idx) || idx < 0 || idx >= services.length) return;
      activeService = idx; renderServiceList(); renderServiceDetail();
    });
  });
}
function renderServiceDetail() {
  const s = services[activeService];
  document.getElementById('serviceDetail').innerHTML = `<span class="tag">${escapeHTML(s.tag)}</span><h3>${escapeHTML(s.t)}</h3><p class="muted">${escapeHTML(s.d)}</p><ul>${s.pts.map(p => `<li>${escapeHTML(p)}</li>`).join('')}</ul>`;
  document.getElementById('fService').innerHTML = services.map(x => `<option${x.t === s.t ? ' selected' : ''}>${escapeHTML(x.t)}</option>`).join('');
}
renderServiceList(); renderServiceDetail();

/* ============ Envío seguro (listo para backend de correos) ============
   - POST JSON por HTTPS (nunca GET con PII en URL).
   - Timeout + validación + honeypot. En modo demo no hay red. */
async function sendQuote(payload) {
  if (!CONFIG.API_BASE) {
    await new Promise(r => setTimeout(r, 600));
    return { ok: true, demo: true };
  }
  if (!/^https:\/\//i.test(CONFIG.API_BASE)) {
    throw new Error('API_BASE debe ser HTTPS');
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), CONFIG.TIMEOUT_MS);
  try {
    const res = await fetch(`${CONFIG.API_BASE}${CONFIG.ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } finally {
    clearTimeout(t);
  }
}

document.getElementById('quoteForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('quoteMsg');
  const btn = form.querySelector('button[type="submit"]');

  const n = document.getElementById('fName').value.trim().slice(0, CONFIG.MAX.nombre);
  const m = document.getElementById('fMail').value.trim().slice(0, CONFIG.MAX.correo);
  const sv = document.getElementById('fService').value;
  const d = document.getElementById('fMsg').value.trim().slice(0, CONFIG.MAX.descripcion);
  const hp = document.getElementById('fWeb') ? document.getElementById('fWeb').value : '';

  if (hp) return; // bot: salida silenciosa
  if (n.length < 2) { msg.textContent = 'Escribe tu nombre (mínimo 2 caracteres).'; return; }
  if (!isEmail(m)) { msg.textContent = 'Escribe un correo válido.'; return; }
  if (!services.some(s => s.t === sv)) { msg.textContent = 'Elige un servicio válido.'; return; }
  if (d.length < 10) { msg.textContent = 'Cuéntanos un poco más (mínimo 10 caracteres).'; return; }

  btn.disabled = true;
  const originalBtn = btn.textContent;
  btn.textContent = 'Enviando…';
  msg.textContent = 'Enviando solicitud…';

  try {
    await sendQuote({ nombre: n, correo: m, tipo: sv, descripcion: d });
    // Solo se guarda lo no sensible (tipo + fecha), nunca nombre/correo/descripción.
    try {
      sessionStorage.setItem('vjtech-quote', JSON.stringify({ sv, at: Date.now() }));
    } catch (_) { /* almacenamiento no disponible: no es crítico */ }
    msg.textContent = `Listo ${n}, recibimos tu solicitud de "${sv}". Te contactaremos a ${m}.`;
    form.reset();
    renderServiceDetail();
  } catch (err) {
    msg.textContent = 'No se pudo enviar. Revisa tu conexión e intenta de nuevo.';
  } finally {
    btn.disabled = false;
    btn.textContent = originalBtn;
  }
});

document.getElementById('faq').innerHTML = [
  ["¿Cuánto tarda una landing?", "De 5 a 7 días con copy y diseño incluidos."],
  ["¿Hacen apps para iOS y Android?", "Sí, con Ionic + Angular: una sola base, dos tiendas."],
  ["¿Qué incluye un sistema para negocios?", "Dashboard, roles, base de datos, reportes y capacitación."],
  ["¿Dan soporte después?", "Sí, 30 días incluidos y planes mensuales opcionales."],
  ["¿Hacen invitaciones virtuales o páginas personales?", "Sí. Invitaciones para eventos y hojas de presentación personal: páginas sencillas de una sola página, listas en 2–4 días."],
  ["¿Cómo empezamos?", "Escríbenos, agendamos llamada y te pasamos alcance + precio fijo."],
].map(f => `<details><summary><strong>${escapeHTML(f[0])}</strong></summary><p class="muted">${escapeHTML(f[1])}</p></details>`).join('');

document.querySelectorAll('[data-plan]').forEach(b => {
  b.addEventListener('click', () => {
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('fMsg').value = `Me interesa el plan ${b.dataset.plan}. `;
  });
});

// --- Menú con efecto + scroll + activo ---
function bindScrollLinks() {
  document.querySelectorAll('[data-scroll]').forEach(a => {
    if (a.dataset.bound) return; a.dataset.bound = "1";
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      // efecto flash
      a.classList.remove('click-flash'); void a.offsetWidth; a.classList.add('click-flash');
      setActive(id);
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
      document.getElementById('mobileMenu').classList.remove('open');
      document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
      // foco accesible
      el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
      if (a.dataset.service) {
        const idx = services.findIndex(s => s.t === a.dataset.service);
        if (idx >= 0) { activeService = idx; renderServiceList(); renderServiceDetail(); }
      }
    });
  });
}
function setActive(id) {
  document.querySelectorAll('.links a, .mobile a').forEach(x =>
    x.classList.toggle('active', x.getAttribute('href') === id));
}
// activo por scroll (IntersectionObserver)
const secs = document.querySelectorAll('#inicio, #servicios, #proyectos, #proceso, #planes, #contacto');
const io = new IntersectionObserver(es => {
  es.forEach(en => { if (en.isIntersecting) setActive('#' + en.target.id); });
}, { rootMargin: '-40% 0px -55% 0px' });
secs.forEach(s => io.observe(s));

bindScrollLinks();
const btn = document.getElementById('menuBtn');
btn.addEventListener('click', () => {
  const m = document.getElementById('mobileMenu');
  const open = m.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* ============ Casos de éxito (para migrar a Angular: exportar `casos`) ============ */
const casos = [
  { id: "blackcross", name: "BlackCross", logo: "imgs/logos/BlackCross.png", tag: "CROSSFIT · APP", d: "App para un box de Crossfit: control de citas, usuarios y paquetes en un solo lugar.", pts: ["Control de citas", "Usuarios y membresías", "Paquetes"] },
  { id: "iroda", name: "IRoda", logo: "imgs/logos/iroda.png", tag: "CYCLING · APP", d: "App para estudio de cycling: gestión de lugares por clase, paquetes y usuarios.", pts: ["Lugares por clase", "Paquetes", "Usuarios"] },
  { id: "lua-studio", name: "LUA Studio", logo: "imgs/logos/LUA.png", tag: "BARRE · APP", d: "App para estudio de barre: gestión de lugares por clase, paquetes y usuarios.", pts: ["Lugares por clase", "Paquetes", "Usuarios"] },
  { id: "documental", name: "Familias Unidas", logo: "imgs/logos/FU.png", tag: "CONSEJERÍA · BACKOFFICE", d: "Sistema documental: gestión de files, envío de correos y mensajes de texto, reportes y usuarios por rol.", pts: ["Gestión de files", "Correos + SMS", "Reportes y roles"] },
];
/* Para poner un logo: agrega `logo: "imgs/logos/nombre.png"` al caso;
   el slot muestra "ESPACIO PARA LOGO" mientras no tenga. */
document.getElementById('casosGrid').innerHTML = casos.map(c => `
  <article class="case" tabindex="0">
    <div class="case-logo" data-logo="${escapeHTML(c.id)}">${c.logo ? `<img src="${escapeHTML(c.logo)}" alt="${escapeHTML(c.name)}" loading="lazy" />` : `<span>ESPACIO PARA LOGO</span>`}</div>
    <div class="pad"><span class="tag">${escapeHTML(c.tag)}</span><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.d)}</p>
    <ul>${c.pts.map(p => `<li>${escapeHTML(p)}</li>`).join('')}</ul>
    <a href="#contacto" data-scroll>Quiero un sistema así ↗</a></div>
  </article>`).join('');
bindScrollLinks();

/* Frontera para futuro: expone datos y envío sin acoplar al DOM,
   para reutilizar desde un backend de correos o componentes Angular. */
window.VJTech = { CONFIG, services, projects, casos, sendQuote, escapeHTML, isEmail };
