const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const progressBar = document.querySelector(".page-progress span");
const revealTargets = [...document.querySelectorAll("[data-reveal]")];
const demandItems = [...document.querySelectorAll(".demands li")];
const evidenceItems = [...document.querySelectorAll(".evidence__item")];
const productStage = document.querySelector(".product-stage");
const benefitIndex = document.querySelector("#benefitIndex");

window.setTimeout(() => document.body.classList.add("is-ready"), 1050);

menuToggle?.addEventListener("click", () => {
  const open = siteHeader?.classList.toggle("menu-open") ?? false;
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader?.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menú");
  });
});

let scrollFrame = 0;
function updateScrollUI() {
  const root = document.documentElement;
  const scrollable = Math.max(1, root.scrollHeight - window.innerHeight);
  root.style.setProperty("--page-progress", String(Math.min(1, window.scrollY / scrollable)));
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
  scrollFrame = 0;
}

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
updateScrollUI();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: "0px 0px -8%" });
revealTargets.forEach((target) => revealObserver.observe(target));

const demandObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    demandItems.forEach((item) => item.classList.toggle("is-current", item === entry.target));
  });
}, { threshold: 0.6 });
demandItems.forEach((item) => demandObserver.observe(item));

const packStates = {
  "01": { y: "-4px", rotate: "-1deg", halo: ".92" },
  "02": { y: "4px", rotate: ".8deg", halo: ".98" },
  "03": { y: "-2px", rotate: "-1.6deg", halo: "1.04" },
  "04": { y: "2px", rotate: ".4deg", halo: "1.1" }
};

function activateEvidence(item) {
  const index = item.dataset.benefit || "01";
  evidenceItems.forEach((entry) => entry.classList.toggle("is-active", entry === item));
  if (benefitIndex) benefitIndex.textContent = index;
  const state = packStates[index];
  if (!productStage || !state) return;
  productStage.style.setProperty("--pack-y", state.y);
  productStage.style.setProperty("--pack-rotate", state.rotate);
  productStage.style.setProperty("--pack-halo", state.halo);
}

const evidenceObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) activateEvidence(visible.target);
}, { threshold: [0.25, 0.45, 0.65], rootMargin: "-22% 0px -28%" });
evidenceItems.forEach((item) => evidenceObserver.observe(item));

const responseLibrary = {
  digest: {
    question: "¿Qué ayuda a una digestión sensible?",
    answers: [
      "Una fórmula altamente digestible y suave con el estómago. Traducción felina: comer bien sin renunciar a la dignidad.",
      "Ingredientes fáciles de digerir y fibra prebiótica. Menos drama estomacal; más tiempo para gobernar el sofá.",
      "Sensitive Stomach & Skin apoya una digestión equilibrada y la absorción óptima de nutrientes. Ciencia servida a tiempo."
    ]
  },
  stool: {
    question: "¿Cómo apoyamos heces firmes?",
    answers: [
      "La fibra prebiótica favorece bacterias intestinales benéficas. Tu caja de arena puede agradecérselo a la ciencia.",
      "Alta digestibilidad más fibra prebiótica: una combinación pensada para una digestión equilibrada y mejores modales en la caja.",
      "Heces firmes empiezan por un microbioma bien nutrido. Es una conversación elegante sobre un tema poco elegante."
    ]
  },
  coat: {
    question: "¿Cómo logramos un pelaje brillante?",
    answers: [
      "Vitamina E y ácidos grasos Omega-3 y 6 ayudan a nutrir la piel y mantener un pelaje lustroso. Los filtros son opcionales.",
      "El brillo sí puede tener respaldo científico: vitamina E y Omegas para una piel sana y un pelaje digno de primer plano.",
      "Piel nutrida, pelaje brillante, actitud intacta. Hill's combina vitamina E con ácidos grasos esenciales para apoyar ambos."
    ]
  },
  antioxidants: {
    question: "¿Qué hacen los antioxidantes?",
    answers: [
      "Antioxidantes clínicamente comprobados y vitaminas C+E ayudan a apoyar un sistema inmune saludable. Todo imperio necesita defensas.",
      "Las vitaminas C+E forman parte de una mezcla antioxidante que apoya las defensas naturales. Ciencia: 1. Caos: bajo control.",
      "Ayudan a respaldar el sistema inmune para que su majestad pueda concentrarse en asuntos importantes, como ignorarte."
    ]
  },
  generic: {
    question: "Tengo otra pregunta",
    answers: [
      "Puedo procesar consultas sobre digestión, microbioma, piel, pelaje o antioxidantes. Elige sabiamente, humano.",
      "Mi especialidad es la nutrición respaldada por ciencia. Dame una pista: ¿estómago, caja de arena, brillo o defensas?",
      "Nueve vidas de procesamiento y todavía necesito una palabra clave. Prueba con digestión, Omegas o antioxidantes."
    ]
  }
};

const chatBody = document.querySelector("#chatBody");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const promptButtons = [...document.querySelectorAll("[data-question]")];
const lastAnswerIndex = new Map();
let chatBusy = false;

function classifyQuestion(question) {
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/antioxid|defensa|inmune|vitamina c/.test(normalized)) return "antioxidants";
  if (/heces|caca|arena|microbioma|prebiot|fibra/.test(normalized)) return "stool";
  if (/pelo|pelaje|piel|brillo|omega|vitamina e/.test(normalized)) return "coat";
  if (/digest|estomago|sensible|absorcion|vomit/.test(normalized)) return "digest";
  return "generic";
}

function pickAnswer(key) {
  const answers = responseLibrary[key].answers;
  const previous = lastAnswerIndex.get(key);
  let next = Math.floor(Math.random() * answers.length);
  if (answers.length > 1 && next === previous) next = (next + 1) % answers.length;
  lastAnswerIndex.set(key, next);
  return answers[next];
}

function setChatDisabled(disabled) {
  promptButtons.forEach((button) => { button.disabled = disabled; });
  if (chatInput) chatInput.disabled = disabled;
  const submit = chatForm?.querySelector("button");
  if (submit) submit.disabled = disabled;
}

function appendMessage(type, label, text) {
  if (!chatBody) return null;
  const message = document.createElement("div");
  message.className = `chat__message chat__message--${type}`;

  if (type === "bot") {
    const avatar = document.createElement("img");
    avatar.src = "assets/catgpt.svg";
    avatar.alt = "";
    avatar.setAttribute("aria-hidden", "true");
    message.append(avatar);
  } else {
    const avatar = document.createElement("span");
    avatar.className = "chat__avatar";
    avatar.textContent = "H";
    avatar.setAttribute("aria-hidden", "true");
    message.append(avatar);
  }

  const content = document.createElement("div");
  const messageLabel = document.createElement("span");
  const paragraph = document.createElement("p");
  messageLabel.textContent = label;
  paragraph.textContent = text;
  content.append(messageLabel, paragraph);
  message.append(content);
  chatBody.append(message);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  return message;
}

function appendTyping() {
  const message = appendMessage("bot", "CATGPT ESTÁ PENSANDO", "");
  if (!message) return null;
  message.classList.add("typing");
  const paragraph = message.querySelector("p");
  if (paragraph) paragraph.innerHTML = "<i></i><i></i><i></i>";
  return message;
}

function askCatgpt(key, customQuestion = "") {
  if (chatBusy || !responseLibrary[key]) return;
  chatBusy = true;
  appendMessage("user", "HUMANO", customQuestion || responseLibrary[key].question);
  setChatDisabled(true);
  const typing = appendTyping();

  window.setTimeout(() => {
    typing?.remove();
    appendMessage("bot", "CATGPT", pickAnswer(key));
    setChatDisabled(false);
    chatBusy = false;
    chatInput?.focus({ preventScroll: true });
  }, 620);
}

promptButtons.forEach((button) => {
  button.addEventListener("click", () => askCatgpt(button.dataset.question));
});

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput?.value.trim();
  if (!question) return;
  chatInput.value = "";
  askCatgpt(classifyQuestion(question), question);
});
