const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("name");
const loginScreen = document.getElementById("login");
const app = document.getElementById("app");
const sudoBadge = document.getElementById("sudo");
const logoutBtn = document.getElementById("logout");
const toast = document.getElementById("toast");
const overlay = document.getElementById("overlay");
const canvas = document.getElementById("watermark");
const ctx = canvas.getContext("2d");

// Show toast
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 2000);
}

// Watermark
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function drawWatermark(text) {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let y = 40; y < canvas.height; y += 80) {
    for (let x = 20; x < canvas.width; x += 220) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.35);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
}

// Login
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return showToast("Introduce tu nombre");

  const sudoNames = ["Luberisse Karl Brad", "Lubérisse Karl Brad"];
  const isSudo = sudoNames.includes(name);

  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");

  if (isSudo) {
    sudoBadge.classList.remove("hidden");
    showToast("Modo sudo activado ⚡");
    drawWatermark(name + " [sudo]");
  } else {
    sudoBadge.classList.add("hidden");
    showToast("Bienvenido " + name);
    drawWatermark(name);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Bloquear clic derecho
document.addEventListener("contextmenu", e => {
  e.preventDefault();
  showToast("Clic derecho no permitido");
});

// Anti-debug
let devtoolsOpen = false;
setInterval(() => {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      overlay.style.display = "block";
      showToast("Depuración detectada");
    }
  } else {
    if (devtoolsOpen) {
      devtoolsOpen = false;
      overlay.style.display = "none";
      showToast("Depuración cerrada");
    }
  }
}, 1000);

window.addEventListener("resize", () => {
  const text = sudoBadge.classList.contains("hidden")
    ? nameInput.value
    : nameInput.value + " [sudo]";
  if (text) drawWatermark(text);
});
