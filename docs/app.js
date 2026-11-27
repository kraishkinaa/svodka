"use strict";

/* Лендинг: манифест версии, подписанные ссылки на установщики и заявки на покупку.
 * Ссылки на /download без короткоживущего токена сервер отклоняет. */
(function () {
  const $ = (s) => document.querySelector(s);
  const SITE = window.SVODKA_SITE || {};
  const locked = !!SITE.downloadsLocked;
  const THEME_KEY = "svodka_th";  const sysDark = () => { try { return matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; } };
  const themeGet = () => { try { const v = localStorage.getItem(THEME_KEY); return v === "dark" || v === "light" ? v : "auto"; } catch (e) { return "auto"; } };
  const themeEffective = () => { const t = themeGet(); return t === "auto" ? (sysDark() ? "dark" : "light") : t; };
  function themePaint() {
    const t = themeEffective();
    document.documentElement.dataset.theme = t;
    const label = t === "dark" ? "Светлая тема" : "Тёмная тема";
    document.querySelectorAll("#site-theme").forEach((b) => {
      b.textContent = t === "dark" ? "☀️" : "🌙";
      b.title = label;
      b.setAttribute("aria-label", label);
    });
  }
  function themeSet(v) {
    try { localStorage.setItem(THEME_KEY, v === "dark" ? "dark" : "light"); } catch (e) {}
    themePaint();
    const f = $("#demo-inline");
    try {
      if (f && f.contentDocument) f.contentDocument.documentElement.dataset.theme = themeEffective();
    } catch (e) {}
  }
  document.querySelectorAll("#site-theme").forEach((b) => {
    b.addEventListener("click", () => themeSet(themeEffective() === "dark" ? "light" : "dark"));
  });
  themePaint();
  function track(event) {
    try {
      if (window.SVODKA_ANALYTICS) window.SVODKA_ANALYTICS.track(event);
    } catch (e) {}
  }
  $("#dl-buy")?.addEventListener("click", () => track("buy_click"));

  const demoFrame = $("#demo-inline");
  let tourPending = false;
  function syncDemoTheme() {
    try {
      if (demoFrame && demoFrame.contentDocument) demoFrame.contentDocument.documentElement.dataset.theme = themeEffective();
    } catch (e) {}
  }
  function sendTour() {
    try {
      if (demoFrame && demoFrame.contentWindow) demoFrame.contentWindow.postMessage({ type: "svodka-tour-start" }, "*");
    } catch (e) {}
  }
  function jumpTo(el) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 8;
    const se = document.scrollingElement || document.documentElement;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    se.scrollTop = Math.max(0, top);
    html.style.scrollBehavior = prev;
  }
  function openDemoSection(withTour) {
    jumpTo($("#demo"));
    if (!withTour) return;
    track("demo_tour");
    tourPending = true;
    setTimeout(sendTour, 350);
    setTimeout(sendTour, 1300);
  }
  demoFrame?.addEventListener("load", () => {
    syncDemoTheme();
    track("demo_ready");
    if (tourPending) {
      tourPending = false;
      setTimeout(sendTour, 300);
    }
  });
  document.querySelectorAll("[data-demo-tour]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openDemoSection(true);
    })
  );
  window.addEventListener("message", (e) => {
    const d = e.data || {};
    if (d.type === "svodka-track" && d.event) track(String(d.event));
    else if (d.type === "svodka-scroll") {
      const el = $("#" + String(d.target || "download"));
      jumpTo(el);
    } else if (d.type === "svodka-demo-close") {
      const el = $("#" + String(d.scroll || "download"));
      jumpTo(el);
    }
  });
  if (demoFrame) syncDemoTheme();

  function openLock() {
    track("download_locked");
    const m = $("#dl-modal");
    if (!m) return;
    const buy = $("#dl-buy");
    const note = $("#dl-buy-note");
    if (buy) {
      if (SITE.buyUrl) {
        buy.href = SITE.buyUrl;
        buy.hidden = false;
      } else {
        buy.hidden = true;
      }
    }
    if (note) note.hidden = !!SITE.buyUrl;
    m.hidden = false;
  }
  function closeLock() {
    const m = $("#dl-modal");
    if (m) m.hidden = true;
  }
  function openPolicy() {
    track("policy_open");
    const m = $("#policy-modal");
    if (!m) return;
    m.hidden = false;
    const b = $("#policy-ok");
    if (b) b.focus();
  }
  function closePolicy() {
    const m = $("#policy-modal");
    if (m) m.hidden = true;
  }
  function applyDownloadLock() {
    document.querySelectorAll("#dl-setup,#dl-portable").forEach((a) => {
      a.removeAttribute("href");
      a.removeAttribute("target");
      a.setAttribute("role", "button");
      a.setAttribute("aria-disabled", "true");
      a.classList.add("locked");
      a.textContent = "Откроется 29 ноября";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openLock();
      });
    });
    ["#hash-setup", "#hash-portable"].forEach((sel) => {
      const el = $(sel);
      if (el) el.textContent = "Релиз 29.11.2026";
    });
    const note = $("#dl-note");
    if (note) note.textContent = "Релиз десктопной версии запланирован на 29 ноября 2026 года. После релиза ссылку пришлём после оплаты. Установщик может вызвать предупреждение SmartScreen — см. вопросы.";
  }
  if (locked) {
    applyDownloadLock();
    const modal = $("#dl-modal");
    $("#dl-close")?.addEventListener("click", closeLock);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeLock();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLock();
    });
  }
  async function signedHref(base, name) {
    const r = await fetch("/api/download-token?file=" + encodeURIComponent(name));
    if (!r.ok) throw new Error("download token");
    const t = await r.json();
    return (base || "/download") + "/" + encodeURIComponent(name) + "?token=" + encodeURIComponent(t.token) + "&expires=" + encodeURIComponent(t.expires);
  }

  function fillFromManifest(m) {
    if (!m || !Array.isArray(m.files) || !m.files.length) return;
    if (m.version) $("#dl-version").textContent = m.version;
    if (locked) return;
    [["#dl-setup", "#hash-setup"], ["#dl-portable", "#hash-portable"]].forEach(async ([linkSel, hashSel]) => {
      const link = $(linkSel);
      const hash = $(hashSel);
      if (!link) return;
      const name = /Setup/i.test(linkSel) ? m.files.find((f) => /Setup/i.test(f.name)) : m.files.find((f) => /Portable/i.test(f.name));
      if (!name) return;
      if (hash) hash.textContent = "SHA-256: " + name.sha256;
      try {
        link.href = await signedHref(m.downloadBase, name.name);
        link.textContent = name.name;
        link.classList.remove("locked");
        link.removeAttribute("role");
        link.removeAttribute("aria-disabled");
      } catch (e) {
        link.href = "#download";
        link.textContent = name.name + " — ссылка недоступна";
      }
    });
  }

  fetch(SITE.manifestUrl || "/release/latest.json")
    .then((r) => (r.ok ? r.json() : null))
    .then(fillFromManifest)
    .catch(() => {});

  /* Заявки на покупку временно закрыты до публикации политики ПДн. */
  document.querySelectorAll("[data-plan]").forEach((b) =>
    b.addEventListener("click", () => {
      const sel = $("#lead-plan");
      if (sel) sel.value = b.dataset.plan;
      openPolicy();
    })
  );
  const form = $("#lead-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      openPolicy();
    });
  }
  $("#policy-ok")?.addEventListener("click", closePolicy);
  $("#policy-modal")?.addEventListener("click", (e) => {
    if (e.target === $("#policy-modal")) closePolicy();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePolicy();
  });
})();
