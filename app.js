// ===== Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function toast(msg) {
  const el = $("#toast");
  const text = $("#toastText");
  text.textContent = msg;
  el.hidden = false;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (el.hidden = true), 1400);
}

// ===== Theme
const THEME_KEY = "portfolio_theme";
function applyTheme(theme) {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
  localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
  toast("Тема переключена");
}
applyTheme(localStorage.getItem(THEME_KEY) || "dark");

// ===== Mobile menu
const burger = $("#burger");
const mobileMenu = $("#mobileMenu");

function setMobile(open) {
  burger.setAttribute("aria-expanded", String(open));
  mobileMenu.hidden = !open;
}
burger?.addEventListener("click", () => setMobile(mobileMenu.hidden));
$$('#mobileMenu a').forEach(a => a.addEventListener("click", () => setMobile(false)));

// ===== Copy email
const EMAIL = "dimash.opg24@gmail.com"; // <-- поменяй на свой
$("#emailText").textContent = EMAIL;
$("#copyEmail")?.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(EMAIL); toast("Email скопирован"); }
  catch { toast("Не получилось скопировать"); }
});
$("#copyEmailMobile")?.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(EMAIL); toast("Email скопирован"); }
  catch { toast("Не получилось скопировать"); }
});
$("#copyEmailMobile span").textContent = EMAIL;

// ===== CV download (простая генерация txt как заглушка)
function downloadCV() {
  const content =
`Dinmukhammed Turakbayev
Software Engineer • Product Builder

Email: ${EMAIL}
GitHub: https://github.com/your-username
LinkedIn: https://www.linkedin.com/in/your-profile

Кратко:
- Full-stack разработка: веб, бэкенд, интеграции
- Дашборды и аналитика
- Автоматизация и боты
- AI-фичи (RAG, поиск, обработка документов)

Проекты:
- AI Search по нормативке
- Дашборд колл-центра
- Telegram бот для задач
- LXP платформа
`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "CV_Dinmukhammed_Turakbayev.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  toast("CV скачан");
}
$("#downloadCv")?.addEventListener("click", downloadCV);
$("#downloadCvMobile")?.addEventListener("click", downloadCV);

// Theme toggles
$("#themeToggle")?.addEventListener("click", toggleTheme);
$("#themeToggleMobile")?.addEventListener("click", toggleTheme);

// ===== Local time
function tickTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  $("#localTime").textContent = `${hh}:${mm}`;
}
tickTime();
setInterval(tickTime, 10_000);

// ===== Year
$("#year").textContent = String(new Date().getFullYear());

// ===== Count-up stats
function animateCount(el, target, duration = 900) {
  const start = performance.now();
  const from = 0;
  function frame(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(from + (target - from) * eased);
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const el = e.target;
      const n = Number(el.getAttribute("data-count") || "0");
      if (!el.__counted) {
        el.__counted = true;
        animateCount(el, n);
      }
    }
  });
}, { threshold: 0.4 });

$$(".statNum").forEach(el => io.observe(el));

// ===== Skill meters
function animateMeters() {
  $$(".meter").forEach(m => {
    const v = Number(m.getAttribute("data-value") || "0");
    const bar = m.querySelector("span");
    if (!m.__done) {
      m.__done = true;
      setTimeout(() => { bar.style.width = `${Math.max(0, Math.min(100, v))}%`; }, 120);
    }
  });
}
const io2 = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.isIntersecting && animateMeters());
}, { threshold: 0.35 });
$$(".meter").forEach(el => io2.observe(el));

// ===== Project filters
const buttons = $$(".seg");
const cards = $$(".project");

function setFilter(filter) {
  buttons.forEach(b => b.classList.toggle("active", b.dataset.filter === filter));
  cards.forEach(c => {
    const tags = (c.dataset.tags || "").split(" ");
    const ok = filter === "all" || tags.includes(filter);
    c.style.display = ok ? "" : "none";
  });
}

buttons.forEach(b => b.addEventListener("click", () => setFilter(b.dataset.filter)));
setFilter("all");

// ===== Modal + search
const cmdModal = $("#cmdModal");
$("#openCmd")?.addEventListener("click", (e) => {
  e.preventDefault();
  cmdModal.showModal();
  setTimeout(() => $("#projectSearch")?.focus(), 80);
});
$("#closeCmd")?.addEventListener("click", () => cmdModal.close());

cmdModal?.addEventListener("click", (e) => {
  const rect = cmdModal.getBoundingClientRect();
  const inDialog =
    rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
  if (!inDialog) cmdModal.close();
});

function searchProjects(q) {
  const query = (q || "").trim().toLowerCase();
  cards.forEach(c => {
    const text = (c.innerText || "").toLowerCase();
    const ok = !query || text.includes(query);
    c.style.display = ok ? "" : "none";
  });
  buttons.forEach(b => b.classList.toggle("active", b.dataset.filter === "all"));
}

$("#projectSearch")?.addEventListener("input", (e) => searchProjects(e.target.value));

// ===== Hotkeys
document.addEventListener("keydown", (e) => {
  if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

  const key = e.key.toLowerCase();
  if (key === "t") toggleTheme();
  if (key === "p") location.hash = "#projects";
  if (key === "e") location.hash = "#experience";
  if (key === "s") location.hash = "#skills";
  if (key === "c") location.hash = "#contacts";

  if (e.key === "/") {
    e.preventDefault();
    cmdModal.showModal();
    setTimeout(() => $("#projectSearch")?.focus(), 80);
  }
});

// ===== Status pulse (рандомно меняет текст)
const statuses = [
  "свободен для проектов",
  "открыт к предложениям",
  "могу подключиться быстро",
  "люблю сложные задачи"
];
setInterval(() => {
  const el = $("#statusText");
  const next = statuses[Math.floor(Math.random() * statuses.length)];
  el.textContent = next;
}, 5500);

// Автозакрытие мобильного меню: клик вне, Esc, ресайз
document.addEventListener("click", (e) => {
  if (!mobileMenu || mobileMenu.hidden) return;
  const isInsideMenu = mobileMenu.contains(e.target);
  const isBurger = burger && burger.contains(e.target);
  if (!isInsideMenu && !isBurger) setMobile(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMobile(false);
});

window.addEventListener("resize", () => {
  // если перешли на десктоп — закрыть меню
  if (window.innerWidth > 980) setMobile(false);
});