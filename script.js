// ===== Theme sync (system + toggle) =====
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function applyTheme(mode) {
  root.classList.remove("light", "dark");
  if (mode === "light") root.classList.add("light");
  if (mode === "dark") root.classList.add("dark");
  localStorage.setItem("theme", mode);
  themeToggle.textContent = mode === "light" ? "🌞" : "🌙";
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  if (stored) return applyTheme(stored);
  // follow system
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}

themeToggle.addEventListener("click", () => {
  const isLight = root.classList.contains("light");
  applyTheme(isLight ? "dark" : "light");
});

// ===== Messages logic =====
const messagesEl = document.getElementById("messages");
const composer = document.getElementById("composer");
const input = document.getElementById("messageInput");
const typingEl = document.getElementById("typing");
const presenceEl = document.getElementById("presence");

// Mock presence + typing
let typingTimer = null;
function showTyping(show = true) {
  typingEl.style.display = show ? "flex" : "none";
}
function setPresence(text) {
  presenceEl.textContent = text;
}

// Append message
function addMessage({ text, outgoing = false, state = "sent", time = nowTime() }) {
  const article = document.createElement("article");
  article.className = `msg ${outgoing ? "outgoing" : "incoming"}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);

  const meta = document.createElement("div");
  meta.className = "meta";
  const t = document.createElement("time");
  t.textContent = time;
  meta.appendChild(t);

  if (outgoing) {
    const stateEl = document.createElement("span");
    stateEl.className = "state";
    stateEl.dataset.state = state;
    stateEl.title = stateTitle(state);
    stateEl.textContent = stateIcon(state);
    meta.appendChild(stateEl);
  }

  bubble.appendChild(meta);

  if (!outgoing) {
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = "https://i.pravatar.cc/40?img=12";
    avatar.alt = "";
    avatar.setAttribute("aria-hidden", "true");
    article.appendChild(avatar);
  }

  article.appendChild(bubble);
  messagesEl.appendChild(article);
  autoScroll();
}

// Auto-scroll to bottom when new message
function autoScroll() {
  const nearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 120;
  if (nearBottom) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

// Helpers
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function stateIcon(state) {
  switch (state) {
    case "sent": return "✔";
    case "delivered": return "✔✔";
    case "seen": return "✔✔";
    default: return "✔";
  }
}
function stateTitle(state) {
  switch (state) {
    case "sent": return "Yuborildi";
    case "delivered": return "Yetkazildi";
    case "seen": return "Ko‘rildi";
    default: return "Holat";
  }
}

// Composer submit (mock send lifecycle)
composer.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // 1) add outgoing as "sent"
  addMessage({ text, outgoing: true, state: "sent" });
  input.value = "";
  input.focus();

  // 2) upgrade state to "delivered" then "seen"
  setTimeout(() => upgradeLastOutgoingState("delivered"), 600);
  setTimeout(() => upgradeLastOutgoingState("seen"), 1400);

  // 3) mock response: show typing then reply
  setPresence("Yozmoqda…");
  showTyping(true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    showTyping(false);
    setPresence("Online");
    addMessage({
      text: "Qabul! Tema tizim bilan sinxron.",
      outgoing: false
    });
  }, 1200);
});

// Upgrade last outgoing message state
function upgradeLastOutgoingState(nextState) {
  const items = [...document.querySelectorAll(".msg.outgoing .state")];
  if (!items.length) return;
  const last = items[items.length - 1];
  last.dataset.state = nextState;
  last.textContent = stateIcon(nextState);
  last.title = stateTitle(nextState);
}

// Back and attach mock buttons
document.getElementById("backBtn").addEventListener("click", () => {
  alert("Mock: orqaga");
});
document.getElementById("attachBtn").addEventListener("click", () => {
  alert("Mock: fayl biriktirish");
});

// Init
initTheme();
autoScroll();
