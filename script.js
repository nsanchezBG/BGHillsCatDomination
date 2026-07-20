const openCatgpt = document.querySelector("#openCatgpt");
const catgpt = document.querySelector("#catgpt");
const chatBody = document.querySelector("#chatBody");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const promptButtons = [...document.querySelectorAll("[data-question]")];
const siteHeader = document.querySelector(".site-header");
const mobileMenu = document.querySelector(".mobile-menu");

const responseLibrary = {
  digest: {
    question: "¿Qué ayuda a una digestión sensible?",
    answers: [
      "Una fórmula altamente digestible, suave con el estómago y pensada para una absorción óptima de nutrientes. Traducción felina: comer bien y conservar la dignidad.",
      "La ciencia recomienda ingredientes fáciles de digerir y fibra prebiótica. Yo recomiendo, además, servir a tiempo. Es una cuestión de respeto.",
      "Sensitive Stomach & Skin apoya la salud digestiva con una receta suave y altamente digestible. Menos drama estomacal; más tiempo para gobernar el sofá."
    ]
  },
  stool: {
    question: "¿Cómo apoyamos heces firmes?",
    answers: [
      "La fibra prebiótica favorece bacterias intestinales benéficas y una digestión equilibrada. Tu nariz puede enviarnos una carta de agradecimiento.",
      "Heces firmes empiezan por una digestión equilibrada. La fibra prebiótica ayuda a nutrir el microbioma intestinal. Ciencia bastante elegante para hablar de la caja de arena.",
      "Una combinación de alta digestibilidad y fibra prebiótica ayuda a mantener el equilibrio digestivo. Resultado: una caja de arena con mejores modales."
    ]
  },
  coat: {
    question: "¿Cómo logramos una piel sana y un pelaje brillante?",
    answers: [
      "Vitamina E y ácidos grasos Omega-3 y 6 ayudan a nutrir la piel y mantener un pelaje lustroso. Los filtros pasan a ser opcionales.",
      "El brillo no es vanidad cuando está respaldado por nutrición: vitamina E y Omegas para apoyar una piel sana y un pelaje digno de primer plano.",
      "Piel nutrida, pelaje brillante y actitud intacta. Hill's combina vitamina E con ácidos grasos esenciales para apoyar ambos."
    ]
  },
  antioxidants: {
    question: "¿Qué hacen los antioxidantes?",
    answers: [
      "Antioxidantes clínicamente comprobados, vitaminas C+E, ayudan a apoyar un sistema inmune saludable. Defensas con respaldo científico y aprobación felina.",
      "Las vitaminas C+E forman parte de una mezcla antioxidante clínicamente comprobada que apoya el sistema inmune. Incluso un imperio necesita buenas defensas.",
      "Los antioxidantes ayudan a respaldar las defensas naturales. En esta fórmula, las vitaminas C+E apoyan un sistema inmune saludable. Ciencia: 1. Caos: bajo control."
    ]
  },
  generic: {
    question: "Tengo otra pregunta",
    answers: [
      "Puedo ayudarte con digestión sensible, fibra prebiótica, piel y pelaje o antioxidantes. Formula tu pregunta como si estuvieras frente al consejo felino.",
      "Mi especialidad es la nutrición respaldada por ciencia. Pregunta por digestión, heces firmes, Omegas, vitamina E o defensas antioxidantes.",
      "Procesé tu consulta con nueve vidas de potencia. Dame una pista: ¿estómago, microbioma, pelaje o sistema inmune?"
    ]
  }
};

const lastAnswerIndex = new Map();
let catgptBusy = false;

function appendMessage(type, label, text) {
  if (!chatBody) return;
  const wrapper = document.createElement("div");
  wrapper.className = `message ${type}-message`;
  const messageLabel = document.createElement("span");
  messageLabel.textContent = label;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  wrapper.append(messageLabel, paragraph);
  chatBody.append(wrapper);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
}

function appendTypingMessage() {
  if (!chatBody) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "message bot-message typing-message";
  const label = document.createElement("span");
  label.textContent = "CATGPT ESTÁ PROCESANDO";
  const dots = document.createElement("p");
  dots.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
  wrapper.append(label, dots);
  chatBody.append(wrapper);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  return wrapper;
}

function pickAnswer(key) {
  const answers = responseLibrary[key].answers;
  const previous = lastAnswerIndex.get(key);
  let next = Math.floor(Math.random() * answers.length);
  if (answers.length > 1 && next === previous) next = (next + 1) % answers.length;
  lastAnswerIndex.set(key, next);
  return answers[next];
}

function classifyQuestion(question) {
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/antioxid|defensa|inmune|vitamina c/.test(normalized)) return "antioxidants";
  if (/heces|caca|arena|microbioma|prebiot|fibra/.test(normalized)) return "stool";
  if (/pelo|pelaje|piel|brillo|omega|vitamina e/.test(normalized)) return "coat";
  if (/digest|estomago|sensible|absorcion|vomit/.test(normalized)) return "digest";
  return "generic";
}

function setChatControlsDisabled(disabled) {
  promptButtons.forEach((button) => { button.disabled = disabled; });
  if (chatInput) chatInput.disabled = disabled;
  const submit = chatForm?.querySelector("button");
  if (submit) submit.disabled = disabled;
}

function askCatgpt(key, customQuestion = "") {
  if (!responseLibrary[key] || !chatBody || catgptBusy) return;
  catgptBusy = true;
  const question = customQuestion || responseLibrary[key].question;
  appendMessage("user", "HUMANO", question);
  setChatControlsDisabled(true);
  const typingMessage = appendTypingMessage();

  window.setTimeout(() => {
    typingMessage?.remove();
    appendMessage("bot", "CATGPT", pickAnswer(key));
    setChatControlsDisabled(false);
    catgptBusy = false;
    chatInput?.focus({ preventScroll: true });
  }, 650);
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

openCatgpt?.addEventListener("click", () => {
  catgpt?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => chatInput?.focus(), 700);
});

mobileMenu?.addEventListener("click", () => {
  const open = siteHeader?.classList.toggle("menu-open") ?? false;
  mobileMenu.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
});

siteHeader?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader.classList.remove("menu-open");
    mobileMenu?.setAttribute("aria-expanded", "false");
  });
});

const revealTargets = [...document.querySelectorAll("[data-reveal]")];

revealTargets.forEach((element) => {
  element.classList.add("reveal");
  const direction = element.dataset.reveal;
  if (direction && direction !== "up") element.classList.add(`from-${direction}`);
  if (element.dataset.revealDelay) {
    element.style.setProperty("--reveal-delay", `${element.dataset.revealDelay}ms`);
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: "0px 0px -7%" });

revealTargets.forEach((element) => revealObserver.observe(element));

let scrollQueued = false;
function updateScrollProgress() {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, window.scrollY / scrollable);
  document.documentElement.style.setProperty("--scroll-progress", progress);
  scrollQueued = false;
}

window.addEventListener("scroll", () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(updateScrollProgress);
}, { passive: true });

updateScrollProgress();
