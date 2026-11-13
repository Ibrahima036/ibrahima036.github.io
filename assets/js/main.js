/* ==========================================================================
   Portfolio d'Ibrahima Bah — scripts
   Chaque fonctionnalité est un module indépendant, lancé une fois la page
   chargée (le script est inclus avec l'attribut defer).

   Sommaire
     1. Constantes et utilitaires
     2. Thème clair / sombre
     3. Grand nom ajusté à la largeur
     4. Notification et copie dans le presse-papiers
     5. Visuel de l'accueil (lignes gravées et orbite)
     6. Carrousel de projets
     7. Onglets des services
     8. Palette de commandes
     9. Formulaire de contact
    10. Démarrage
   ========================================================================== */

"use strict";


/* 1. Constantes et utilitaires
   -------------------------------------------------------------------------- */

const CONTACT = {
  email: "ibrahimibnmohamed9697@gmail.com",
  phone: "+224 624 95 97 00",
  whatsapp: "https://wa.me/224624959700",
  github: "https://github.com/ibrahima036",
  source: "https://github.com/Ibrahima036/ibrahima036.github.io",
};

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefersLight = window.matchMedia("(prefers-color-scheme: light)");

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/** Relance une animation CSS sur un élément. */
function replayAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

/** Ouvre un lien externe dans un nouvel onglet. */
function openExternal(url) {
  const link = Object.assign(document.createElement("a"), { href: url, target: "_blank", rel: "noopener" });
  document.body.append(link);
  link.click();
  link.remove();
}

/** Fait défiler la page jusqu'à une section. */
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
}


/* 2. Thème clair / sombre
   --------------------------------------------------------------------------
   Le choix du visiteur est appliqué dans le <head> (voir index.html) pour
   éviter un flash ; ici on gère le bouton et on prévient le reste du code. */

const theme = {
  current() {
    return root.dataset.theme || (prefersLight.matches ? "light" : "dark");
  },

  toggle() {
    const next = theme.current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* stockage indisponible */ }
  },

  init() {
    const button = $("[data-theme-toggle]");
    const label = $("[data-theme-label]");
    const syncLabel = () => { label.textContent = theme.current() === "dark" ? "Sombre" : "Clair"; };

    button.addEventListener("click", theme.toggle);
    prefersLight.addEventListener("change", () => document.dispatchEvent(new Event("themechange")));
    new MutationObserver(() => document.dispatchEvent(new Event("themechange")))
      .observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("themechange", syncLabel);
    syncLabel();
  },
};


/* 3. Grand nom ajusté à la largeur
   -------------------------------------------------------------------------- */

function initFitText() {
  const elements = $$("[data-fit-text]");

  const fit = () => {
    elements.forEach((element) => {
      const text = element.firstElementChild;
      element.style.fontSize = "100px";
      const naturalWidth = text.getBoundingClientRect().width;
      if (naturalWidth > 0) {
        element.style.fontSize = `${Math.floor((100 * element.clientWidth / naturalWidth) * 0.995)}px`;
      }
    });
  };

  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener("resize", fit);
}


/* 4. Notification et copie dans le presse-papiers
   -------------------------------------------------------------------------- */

const toast = {
  element: null,
  timer: 0,

  show(message) {
    toast.element.textContent = message;
    toast.element.classList.add("toast--visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.element.classList.remove("toast--visible"), 2200);
  },

  init() {
    toast.element = $("[data-toast]");
  },
};

/** Copie un texte et confirme par une notification (ou affiche le texte si la copie échoue). */
async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value);
    toast.show(successMessage);
  } catch (e) {
    toast.show(value);
  }
}

/** Tous les boutons [data-copy] copient leur valeur. */
function initCopyButtons() {
  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copy, button.dataset.copyDone || "Copié"));
  });
}


/* 5. Visuel de l'accueil
   --------------------------------------------------------------------------
   Des lignes horizontales ondulent autour d'un médaillon (la photo) ; une
   orbite orange passe derrière la photo en haut et devant en bas. Sans
   photo, une sphère gravée est dessinée à sa place. La lumière suit la
   souris sur ordinateur. */

function initHeroArt() {
  const canvas = $("[data-hero-canvas]");
  const photo = $("[data-hero-photo]");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  let light = { x: -0.55, y: -0.6 };
  let frame = 0;

  const cssColor = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const photoIsReady = () => Boolean(photo && !photo.hidden && photo.complete && photo.naturalWidth > 0);

  function placePhoto(cx, cy, radius) {
    Object.assign(photo.style, {
      left: `${cx - radius}px`,
      top: `${cy - radius}px`,
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
    });
  }

  function drawLines(width, height, cx, cy, radius, hasPhoto) {
    const gap = Math.max(4, height / 70);
    const step = 3;
    const lz = Math.sqrt(Math.max(0, 1 - light.x ** 2 - light.y ** 2));

    context.lineCap = "round";
    context.strokeStyle = cssColor("--color-fg");

    for (let y0 = -gap * 2; y0 < height + gap * 2; y0 += gap) {
      let previous = null;

      for (let x = 0; x <= width + step; x += step) {
        const dx = (x - cx) / radius;
        const dy = (y0 - cy) / radius;
        const distanceSq = dx * dx + dy * dy;
        let y;
        let lineWidth;
        let alpha;

        if (distanceSq < 1 && hasPhoto) {
          previous = null;
          continue;
        }

        if (distanceSq < 1) {
          // Sphère : lignes resserrées et plus épaisses côté ombre.
          const nz = Math.sqrt(1 - distanceSq);
          const luminance = Math.max(0, dx * light.x + dy * light.y + nz * lz);
          y = cy + dy * radius * (0.82 + 0.18 * (1 - nz)) + Math.sin(dx * 6 + dy * 3) * 1.2;
          lineWidth = 0.35 + 2.1 * Math.pow(1 - luminance, 1.4);
          alpha = 0.95;
        } else {
          // Autour : ondulations qui s'estompent avec la distance, et une ombre portée.
          const distance = Math.sqrt(distanceSq);
          y = y0
            + Math.sin(x * 0.012 + y0 * 0.045) * 4 * Math.min(1, (distance - 1) * 2)
            + Math.sin(x * 0.031 - y0 * 0.02) * 2;
          lineWidth = 0.5 + 0.6 * Math.max(0, Math.sin(x * 0.02 + y0 * 0.07));
          alpha = Math.max(0, 0.5 - (distance - 1) * 0.22);

          const sx = (x - (cx - light.x * radius * 0.6)) / (radius * 1.5);
          const sy = (y0 - (cy + radius * 1.05)) / (radius * 0.32);
          const shadow = sx * sx + sy * sy;
          if (shadow < 1) lineWidth += 1.4 * (1 - shadow);
        }

        if (previous && alpha > 0.02) {
          context.globalAlpha = alpha;
          context.lineWidth = lineWidth;
          context.beginPath();
          context.moveTo(previous.x, previous.y);
          context.lineTo(x, y);
          context.stroke();
        }
        previous = { x, y };
      }
    }
  }

  function drawOrbit(width, height, cx, cy, radius, hasPhoto) {
    const rx = radius * 1.45;
    const ry = radius * 0.36;
    const offset = hasPhoto ? radius * 0.5 : 0;
    const tilt = hasPhoto ? -0.24 : -0.32;
    const accent = cssColor("--color-accent");

    context.globalAlpha = 1;
    context.strokeStyle = accent;
    context.fillStyle = accent;
    context.lineWidth = 1.4;
    context.save();
    context.translate(cx, cy + offset);
    context.rotate(tilt);

    if (hasPhoto) {
      // Moitié arrière : masquée là où elle passe derrière la photo.
      context.save();
      context.beginPath();
      context.rect(-width * 2, -height * 2, width * 4, height * 4);
      context.arc(Math.sin(-tilt) * offset, -Math.cos(-tilt) * offset, radius + 1, 0, Math.PI * 2);
      context.clip("evenodd");
      context.beginPath();
      context.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2);
      context.stroke();
      context.restore();

      // Moitié avant : passe devant la photo.
      context.beginPath();
      context.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
      context.stroke();
      context.beginPath();
      context.arc(rx * Math.cos(Math.PI * 0.18), ry * Math.sin(Math.PI * 0.18), 4.5, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.ellipse(0, 0, rx, ry, 0, Math.PI * 0.98, Math.PI * 2.02);
      context.stroke();
      context.beginPath();
      context.arc(rx * Math.cos(Math.PI * 1.86), ry * Math.sin(Math.PI * 1.86), 4.5, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  function draw() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const cx = width * 0.56;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * 0.36;
    const hasPhoto = photoIsReady();

    if (hasPhoto) placePhoto(cx, cy, radius);
    drawLines(width, height, cx, cy, radius, hasPhoto);
    drawOrbit(width, height, cx, cy, radius, hasPhoto);
  }

  const requestDraw = () => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); });
  };

  if (photo) {
    photo.addEventListener("load", requestDraw);
    photo.addEventListener("error", () => { photo.hidden = true; requestDraw(); });
    if (photo.complete && photo.naturalWidth === 0) photo.hidden = true;
  }

  window.addEventListener("resize", requestDraw);
  document.addEventListener("themechange", requestDraw);

  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      const box = canvas.getBoundingClientRect();
      const clamp = (value) => Math.max(-0.75, Math.min(0.75, value));
      light = {
        x: clamp(((event.clientX - (box.left + box.width * 0.56)) / window.innerWidth) * 1.4),
        y: clamp(((event.clientY - (box.top + box.height * 0.5)) / window.innerHeight) * 1.4),
      };
      requestDraw();
    });
  }

  draw();
}


/* 6. Carrousel de projets
   --------------------------------------------------------------------------
   Les cartes (.project-card) et les détails (.project) sont dans le HTML,
   dans le même ordre. Le script affiche un projet à la fois. */

function initProjects() {
  const container = $("[data-projects]");
  if (!container) return;

  const stage = $("[data-projects-stage]", container);
  const cards = $$(".project-card", stage);
  const details = $$(".project", container);
  let index = 0;

  function render(animate) {
    cards.forEach((card, i) => {
      const position = (i - index + cards.length) % cards.length;
      card.dataset.pos = position <= 2 ? String(position) : "hidden";
      card.setAttribute("aria-hidden", String(position !== 0));
    });

    details.forEach((article, i) => {
      article.hidden = i !== index;
      if (i === index && animate) replayAnimation(article, "project--enter");
    });
  }

  function go(direction) {
    index = (index + direction + cards.length) % cards.length;
    render(true);
  }

  $("[data-projects-prev]", container).addEventListener("click", () => go(-1));
  $("[data-projects-next]", container).addEventListener("click", () => go(1));

  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
  });

  // Glisser du doigt sur mobile.
  let startX = null;
  stage.addEventListener("pointerdown", (event) => { startX = event.clientX; });
  stage.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;
    if (Math.abs(distance) > 40) go(distance < 0 ? 1 : -1);
  });

  render(false);
}


/* 7. Onglets des services
   --------------------------------------------------------------------------
   L'onglet de l'offre visible au milieu de l'écran est mis en avant. */

function initServiceTabs() {
  const tabs = $$("[data-services-tabs] a");
  if (!tabs.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      tabs.forEach((tab) => {
        const active = tab.getAttribute("href") === `#${entry.target.id}`;
        tab.classList.toggle("services__tab--active", active);
        if (active) tab.setAttribute("aria-current", "true");
        else tab.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });

  $$(".service").forEach((service) => observer.observe(service));
}


/* 8. Palette de commandes
   --------------------------------------------------------------------------
   S'ouvre avec Ctrl K (⌘ K sur Mac), la touche / ou le bouton de l'en-tête. */

function initPalette() {
  const dialog = $("[data-palette]");
  const input = $(".palette__input", dialog);
  const list = $(".palette__list", dialog);

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$("[data-shortcut]").forEach((key) => { key.textContent = isMac ? "⌘ K" : "Ctrl K"; });

  const commands = [
    { group: "Aller à", label: "Accueil", hint: "/", keywords: "haut debut", run: () => scrollToSection("accueil") },
    { group: "Aller à", label: "Projets", hint: "/projets", keywords: "baara garage sisep cartes", run: () => scrollToSection("projets") },
    { group: "Aller à", label: "Services", hint: "/services", keywords: "offre creer reprendre automatiser", run: () => scrollToSection("services") },
    { group: "Aller à", label: "Outils", hint: "/outils", keywords: "stack technologies competences", run: () => scrollToSection("outils") },
    { group: "Aller à", label: "Clients", hint: "/clients", keywords: "parcours experience afri-learning inekto djogo brainsense yatou garage", run: () => scrollToSection("clients") },
    { group: "Aller à", label: "Contact", hint: "/messages", keywords: "ecrire message email", run: () => scrollToSection("contact") },
    { group: "Actions", label: "Copier mon e-mail", hint: "e-mail", keywords: "mail adresse", run: () => copyText(CONTACT.email, "E-mail copié") },
    { group: "Actions", label: "Copier mon numéro", hint: "+224", keywords: "telephone numero", run: () => copyText(CONTACT.phone, "Numéro copié") },
    { group: "Actions", label: "Écrire sur WhatsApp", hint: "wa.me", keywords: "whatsapp message", run: () => openExternal(CONTACT.whatsapp) },
    { group: "Actions", label: "Ouvrir mon GitHub", hint: "github.com", keywords: "code depots", run: () => openExternal(CONTACT.github) },
    { group: "Actions", label: "Changer de thème", hint: "clair / sombre", keywords: "theme dark light mode", run: theme.toggle },
    { group: "Actions", label: "Voir le code de ce site", hint: "source", keywords: "github source portfolio", run: () => openExternal(CONTACT.source) },
  ];

  let results = [];
  let selected = 0;

  const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function createItem(command, i) {
    const item = document.createElement("li");
    item.className = "palette__item";
    item.id = `palette-option-${i}`;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(i === selected));
    item.dataset.index = String(i);

    const label = document.createElement("span");
    label.textContent = command.label;
    const hint = document.createElement("span");
    hint.className = "palette__hint";
    hint.textContent = command.hint;

    item.append(label, hint);
    return item;
  }

  function render() {
    const query = normalize(input.value.trim());
    results = commands.filter((c) => !query || normalize(`${c.label} ${c.hint} ${c.keywords}`).includes(query));
    selected = Math.min(selected, Math.max(0, results.length - 1));

    list.replaceChildren();
    if (!results.length) {
      const empty = document.createElement("li");
      empty.className = "palette__empty";
      empty.textContent = "Aucun résultat. Essayez « contact » ou « projets ».";
      list.append(empty);
    }

    let lastGroup = "";
    results.forEach((command, i) => {
      if (command.group !== lastGroup) {
        const group = document.createElement("li");
        group.className = "palette__group";
        group.setAttribute("role", "presentation");
        group.textContent = command.group;
        list.append(group);
        lastGroup = command.group;
      }
      list.append(createItem(command, i));
    });

    input.setAttribute("aria-activedescendant", results.length ? `palette-option-${selected}` : "");
    document.getElementById(`palette-option-${selected}`)?.scrollIntoView({ block: "nearest" });
  }

  function open() {
    if (dialog.open) return;
    input.value = "";
    selected = 0;
    render();
    dialog.showModal();
    input.focus();
  }

  const close = () => dialog.close();

  function run(i) {
    const command = results[i];
    if (!command) return;
    close();
    setTimeout(command.run, 30);
  }

  $("[data-palette-open]").addEventListener("click", open);
  input.addEventListener("input", () => { selected = 0; render(); });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); selected = Math.min(results.length - 1, selected + 1); render(); }
    if (event.key === "ArrowUp") { event.preventDefault(); selected = Math.max(0, selected - 1); render(); }
    if (event.key === "Enter") { event.preventDefault(); run(selected); }
  });

  list.addEventListener("click", (event) => {
    const item = event.target.closest(".palette__item");
    if (item) run(Number(item.dataset.index));
  });

  list.addEventListener("mousemove", (event) => {
    const item = event.target.closest(".palette__item");
    if (item && Number(item.dataset.index) !== selected) {
      selected = Number(item.dataset.index);
      render();
    }
  });

  // Un clic sur le fond (en dehors de la boîte) ferme la palette.
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });

  document.addEventListener("keydown", (event) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      dialog.open ? close() : open();
    } else if (event.key === "/" && !typing && !dialog.open) {
      event.preventDefault();
      open();
    }
  });
}


/* 9. Formulaire de contact
   --------------------------------------------------------------------------
   Le site n'a pas de serveur : le formulaire ouvre la messagerie du
   visiteur avec un message prérempli. */

function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;

  const error = $("[data-form-error]", form);
  const response = $("[data-form-response]", form);
  const copyButton = $("[data-form-copy]", form);
  const subjects = { poste: "Recrutement", projet: "Projet", bonjour: "Bonjour" };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let lastMessage = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.nom.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const subject = form.sujet.value;

    if (!name || !email || !message) {
      error.textContent = "400 : renseignez votre nom, votre e-mail et votre message.";
      return;
    }
    if (!emailPattern.test(email)) {
      error.textContent = "422 : l'adresse e-mail semble incomplète.";
      form.email.focus();
      return;
    }

    error.textContent = "";
    lastMessage = `${message}\n\n${name}\n${email}`;
    response.hidden = false;

    const mailSubject = `${subjects[subject]} : message de ${name}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(lastMessage)}`;
  });

  copyButton.addEventListener("click", () => copyText(lastMessage, "Message copié"));

  $("[data-form-reset]", form).addEventListener("click", () => {
    form.reset();
    response.hidden = true;
    form.nom.focus();
  });
}


/* 10. Démarrage
   -------------------------------------------------------------------------- */

function init() {
  $$("[data-year]").forEach((element) => { element.textContent = new Date().getFullYear(); });

  theme.init();
  toast.init();
  initFitText();
  initCopyButtons();
  initHeroArt();
  initProjects();
  initServiceTabs();
  initPalette();
  initContactForm();

  console.log("%cVous lisez le code ? Moi aussi.", "font: 600 14px sans-serif; color: #ee8d5e");
  console.log(`Ce site est écrit à la main, sans framework. Écrivez-moi : ${CONTACT.email}`);
}

init();
