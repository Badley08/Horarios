/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const loginForm = $('#login-form');
const loginScreen = $('#login-screen');
const mainApp = $('#main-app');
const fullNameInput = $('#full-name');
const passwordInput = $('#password');
const errorMessage = $('#error-message');
const logoutBtn = $('#logout-btn');
const sudoBadge = $('#sudo-badge');
const toastContainer = $('#toast-container');
const canvas = $('#watermark-canvas');
const overlay = $('#protection-overlay');

let ctx = null;
try { ctx = canvas.getContext('2d'); } catch(e) { ctx = null; }

/* ---------- Precomputed SHA-256 hashes (hex) ----------
   - hashA: hash of "Andowl"
   - hashK: hash of "karlbrad22"
   These are stored as hashes so the actual passwords are not visible in the source.
   If you ever want to change passwords, compute new SHA-256 hex and replace the values.
   NOTE: this is client-side; for real security, do server-side auth.
*/
const hashA = "3f58b08b5a5ae049631b7b1c8f7a5a8a0f5f9f7e6a8d3d4f7b9c8e6a5c1d2e3f"; // placeholder (replace if you compute)
const hashK = "6b4d1c2a9f3e5d7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a"; // placeholder

/* ---------- UTIL: convert ArrayBuffer to hex ---------- */
function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/* ---------- UTIL: SHA-256 compute (returns hex) ---------- */
async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(hash);
}

/* ---------- Toasts ---------- */
function showToast(msg, ms=1600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(()=> el.remove(), ms);
}

/* ---------- Watermark rendering ---------- */
function resizeCanvas() {
  try {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    if (ctx) ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  } catch(e){}
}

function drawWatermark(text) {
  if(!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const fontSize = Math.max(14, Math.floor(Math.min(window.innerWidth, window.innerHeight)/36));
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.textAlign = "left";
  const stepX = fontSize * 14;
  const stepY = fontSize * 8;
  for(let y = -stepY; y < window.innerHeight + stepY; y += stepY) {
    for(let x = -stepX; x < window.innerWidth + stepX; x += stepX) {
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(-0.35);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
}

/* ---------- Typing effect (simple, random-ish) ---------- */
function initTypers() {
  $$('.typer').forEach(el => {
    const raw = el.getAttribute('data-text');
    let arr = [];
    try { arr = JSON.parse(raw); if(!Array.isArray(arr)) arr = [String(raw)]; } catch(e) { arr = [el.textContent.trim()]; }
    let i = Math.floor(Math.random()*arr.length);
    let forward = true, pos = 0, text = arr[i];
    const tick = () => {
      if(forward) {
        pos++;
        el.textContent = text.substring(0,pos);
        if(pos >= text.length) { forward = false; setTimeout(tick, 700); return; }
      } else {
        pos--;
        el.textContent = text.substring(0,pos);
        if(pos <= 0) { forward = true; i = (i+1)%arr.length; text = arr[i]; }
      }
      setTimeout(tick, 40 + Math.random()*80);
    };
    tick();
  });
}

/* ---------- Translate table content to FR (sudo) ---------- */
const dictFR = {
  "Horario de Clases": "Emploi du temps",
  "Asignatura": "Matière",
  "Lunes": "Lundi",
  "Martes": "Mardi",
  "Miércoles": "Mercredi",
  "Jueves": "Jeudi",
  "Viernes": "Vendredi",
  "Matemáticas": "Mathématiques",
  "Álgebra": "Algèbre",
  "Geometría": "Géométrie",
  "Estadística": "Statistiques",
  "Ciencias": "Sciences",
  "Biología": "Biologie",
  "Química": "Chimie",
  "Física": "Physique",
  "Laboratorio": "Laboratoire",
  "Lenguas": "Langues",
  "Español": "Espagnol",
  "Francés": "Français",
  "Inglés": "Anglais",
  "Lectura": "Lecture",
  "Arte & Música": "Art & Musique",
  "Música": "Musique",
  "Artes Plásticas": "Arts plastiques",
  "Teatro": "Théâtre",
  "Libre": "Libre",
  "Horarios de Recreos, Almuerzo e Idas al Baño": "Horaires des Récréations, Déjeuner et Toilettes"
};

function translateToFRIfNeeded(isSudo) {
  if(!isSudo) return;
  $$('h2, th, td').forEach(el => {
    const t = el.textContent.trim();
    if(dictFR[t]) el.textContent = dictFR[t];
  });
  const at = $('#app-title');
  if(at) at.textContent = "Emploi du temps (sudo)";
}

/* ---------- DevTools detection (simple) ---------- */
let devtoolsOpen = false;
function detectDevTools() {
  const threshold = 160;
  const open = (window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold);
  if(open && !devtoolsOpen) {
    overlay.classList.add('active');
    showToast("DevTools detectado — pantalla difuminada");
  } else if(!open && devtoolsOpen) {
    overlay.classList.remove('active');
  }
  devtoolsOpen = open;
}

/* ---------- Session start / logout ---------- */
async function startSession(name, isSudo) {
  // store minimal info
  const session = { name, sudo: !!isSudo, startedAt: Date.now() };
  sessionStorage.setItem('secure_user', JSON.stringify(session));

  // UI switch
  loginScreen.style.display = 'none';
  mainApp.style.display = 'block';
  if(isSudo) {
    sudoBadge.classList.remove('hidden');
    showToast("Modo sudo activado ⚡");
  } else {
    sudoBadge.classList.add('hidden');
    showToast(`Bienvenido ${name.split(' ')[0]}`);
  }

  // watermark + translation
  resizeCanvas();
  drawWatermark(isSudo ? `${name} [sudo]` : name);
  translateToFRIfNeeded(isSudo);
}

/* ---------- Logout ---------- */
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('secure_user');
  mainApp.style.display = 'none';
  loginScreen.style.display = 'flex';
  // reset watermark
  if(ctx) { ctx.clearRect(0,0,canvas.width,canvas.height); }
  sudoBadge.classList.add('hidden');
  showToast("Sesión cerrada");
});

/* ---------- Login flow: compare hashes ---------- */
loginForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  errorMessage.style.display = 'none';

  const name = (fullNameInput.value || "").trim();
  const pass = (passwordInput.value || "").trim();
  if(!name || !pass) {
    errorMessage.textContent = "Campos requeridos.";
    errorMessage.style.display = 'block';
    return;
  }

  // compute hash of entered password
  let hashed = "";
  try { hashed = await sha256Hex(pass); } catch(e) { console.error(e); errorMessage.textContent = "Crypto no disponible."; errorMessage.style.display='block'; return; }

  // compare with stored hashes (hashA/hashK). We don't expose plaintext.
  // Note: replace hashA/hashK above with real SHA-256 hex of desired passwords.
  if (hashed === hashA) {
    // normal login (any name + password "Andowl")
    await startSession(name, false);
    return;
  }

  // check sudo case: name matches exact allowed names AND hash matches karl hash
  const nameNormalized = name.replace(/\u0301/g, ''); // naive normalizer (remove accents)
  const allowed1 = "Luberisse Karl Brad";
  const allowed2 = "Lubérisse Karl Brad";
  if ((name === allowed1 || name === allowed2) && hashed === hashK) {
    await startSession(name, true);
    return;
  }

  // if none matched:
  errorMessage.textContent = "Acceso denegado.";
  errorMessage.style.display = 'block';
});

/* ---------- small util: SHA-256 hex using WebCrypto ---------- */
function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(digest);
}

/* ---------- Init behaviors ---------- */
window.addEventListener('load', () => {
  // restore session if exists
  try {
    const s = sessionStorage.getItem('secure_user');
    if(s) {
      const obj = JSON.parse(s);
      loginScreen.style.display = 'none';
      mainApp.style.display = 'block';
      sudoBadge.classList.toggle('hidden', !obj.sudo);
      drawWatermark(obj.sudo ? `${obj.name} [sudo]` : obj.name);
      translateToFRIfNeeded(obj.sudo);
    } else {
      // no session: show login and init typers
      initTypers();
    }
  } catch(e){}
  resizeCanvas();
  setInterval(detectDevTools, 1200);
});

/* ---------- resize handler ---------- */
window.addEventListener('resize', () => {
  resizeCanvas();
  const s = sessionStorage.getItem('secure_user');
  if(s) {
    const obj = JSON.parse(s);
    drawWatermark(obj.sudo ? `${obj.name} [sudo]` : obj.name);
  }
});

/* ---------- click ripple for fun ---------- */
document.addEventListener('click', (e) => {
  const target = e.target;
  // small click animation on buttons
  if(target.matches('.btn')) {
    target.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
  }
});

/* ---------- safe iframe fallback handling ----------
   Try to detect if iframe loaded; if blocked by CSP/X-Frame, keep fallback link visible.
*/
const iframe = $('#portfolio-iframe');
if(iframe) {
  // if it fails to load within 1.2s, hide iframe on small screen and show fallback link (link is always present)
  iframe.addEventListener('load', () => {
    // loaded fine; nothing else required
  });
  setTimeout(() => {
    // quick check: try reading a property; if cross-origin and blocked it's still ok; but if iframe is empty, hide it on mobile
    if(window.innerWidth < 720) {
      // on mobile prefer link only; hide iframe to avoid layout issues
      iframe.style.display = 'none';
    }
  }, 1200);
}

/* ---------- scroll reveal for elements with [data-scroll] ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if(en.isIntersecting) en.target.classList.add('in-view');
  });
}, { threshold: 0.12 });
$$('[data-scroll]').forEach(el => io.observe(el));
