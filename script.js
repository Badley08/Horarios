/* === Selectors helpers === */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* === Elements === */
const loginScreen = $('#login-screen');
const loginForm = $('#login-form');
const mainApp = $('#main-app');
const fullNameInput = $('#full-name');
const passwordInput = $('#password');
const errorMessage = $('#error-message');
const logoutBtn = $('#logout-btn');
const sudoBadge = $('#sudo-badge');
const appTitle = $('#app-title');
const toastContainer = $('#toast-container');
const canvas = $('#watermark-canvas');
const overlay = $('#protection-overlay');

let ctx = canvas.getContext('2d');
let currentUser = null;
let devtoolsOpen = false;

/* === Traduction FR (sudo only) === */
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
  "Libre": "Libre"
};

/* === Resize watermark canvas === */
function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  if (ctx) ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

/* === Draw watermark === */
function drawWatermark(text) {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const fontSize = 18;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.textAlign = "left";
  const stepX = 220;
  const stepY = 140;

  for (let y = -stepY; y < window.innerHeight + stepY; y += stepY) {
    for (let x = -stepX; x < window.innerWidth + stepX; x += stepX) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.35);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
}

/* === Show toast === */
function showToast(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  toastContainer.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

/* === Login handler === */
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = fullNameInput.value.trim();
  const pass = passwordInput.value.trim();

  if (!name || !pass) {
    errorMessage.textContent = "Campos requeridos.";
    errorMessage.style.display = "block";
    return;
  }

  if (pass === "Andowl") {
    // Normal mode
    startSession({ name, sudo: false });
  } else if (
    (name === "Luberisse Karl Brad" || name === "Lubérisse Karl Brad") &&
    pass === "karlbrad22"
  ) {
    // Sudo mode
    startSession({ name, sudo: true });
  } else {
    errorMessage.textContent = "Acceso denegado.";
    errorMessage.style.display = "block";
    return;
  }
});

/* === Start session === */
function startSession(user) {
  currentUser = user;
  sessionStorage.setItem("secure_user", JSON.stringify(user));
  loginScreen.style.display = "none";
  mainApp.style.display = "block";

  // Watermark
  resizeCanvas();
  drawWatermark(user.sudo ? `${user.name} [sudo]` : user.name);

  // Badge sudo
  if (user.sudo) {
    sudoBadge.classList.remove("hidden");
    translateToFR();
    showToast("Conectado en modo sudo ⚡");
  } else {
    sudoBadge.classList.add("hidden");
    showToast("Conectado correctamente ✅");
  }
}

/* === Logout === */
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("secure_user");
  currentUser = null;
  mainApp.style.display = "none";
  loginScreen.style.display = "flex";
  showToast("Sesión cerrada 🚪");
});

/* === Traduction FR si sudo === */
function translateToFR() {
  $$("table, h2, th, td").forEach(el => {
    const txt = el.textContent.trim();
    if (dictFR[txt]) el.textContent = dictFR[txt];
  });
  $("#app-title").textContent = "Emploi du temps (sudo)";
}

/* === Typing effect === */
function typerEffect() {
  $$(".typer").forEach(el => {
    const texts = JSON.parse(el.getAttribute("data-text"));
    let i = 0, j = 0;
    let current = texts[i];
    let forward = true;

    function type() {
      if (forward) {
        el.textContent = current.substring(0, j++);
        if (j > current.length) {
          forward = false;
          setTimeout(type, 1000);
          return;
        }
      } else {
        el.textContent = current.substring(0, j--);
        if (j < 0) {
          forward = true;
          i = (i + 1) % texts.length;
          current = texts[i];
        }
      }
      setTimeout(type, 120);
    }
    type();
  });
}

/* === Event listeners === */
window.addEventListener("resize", () => {
  if (currentUser) drawWatermark(currentUser.sudo ? `${currentUser.name} [sudo]` : currentUser.name);
});

document.addEventListener("click", e => {
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = e.pageX + "px";
  ripple.style.top = e.pageY + "px";
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

document.addEventListener("scroll", () => {
  showToast("Scroll detectado ⬇️");
}, { once: true });

/* === DevTools detection === */
function detectDevTools() {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    if (!devtoolsOpen) {
      overlay.classList.add("active");
      showToast("DevTools detectado 🚫");
    }
    devtoolsOpen = true;
  } else {
    if (devtoolsOpen) overlay.classList.remove("active");
    devtoolsOpen = false;
  }
}
setInterval(detectDevTools, 1200);

/* === Load session if exists === */
window.addEventListener("load", () => {
  typerEffect();
  const stored = sessionStorage.getItem("secure_user");
  if (stored) {
    startSession(JSON.parse(stored));
  }
});
