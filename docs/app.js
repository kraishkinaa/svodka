"use strict";

/* Лендинг: манифест версии, подписанные ссылки на установщики и заявки на покупку.
 * Ссылки на /download без короткоживущего токена сервер отклоняет. */
(function () {
  const $ = (s) => document.querySelector(s);
  const SITE = window.SVODKA_SITE || {};
  const locked = !!SITE.downloadsLocked;

  function openLock() {
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
  function applyDownloadLock() {
    document.querySelectorAll("#dl-setup,#dl-portable").forEach((a) => {
      a.removeAttribute("href");
      a.removeAttribute("target");
      a.setAttribute("role", "button");
      a.setAttribute("aria-disabled", "true");
      a.classList.add("locked");
      a.textContent = "Скачивание скоро";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openLock();
      });
    });
    ["#hash-setup", "#hash-portable"].forEach((sel) => {
      const el = $(sel);
      if (el) el.textContent = "Ссылка появится после оплаты";
    });
    const note = $("#dl-note");
    if (note) note.textContent = "Пока приложение не выложено в открытый доступ. После оплаты пришлём ссылку в Telegram.";
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
  if (SITE.demoUrl) {
    document.querySelectorAll("[data-demo-link]").forEach((a) => {
      a.href = SITE.demoUrl;
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

  /* Заявки на покупку. */
  document.querySelectorAll("[data-plan]").forEach((b) =>
    b.addEventListener("click", () => {
      const sel = $("#lead-plan");
      if (sel) sel.value = b.dataset.plan;
      const sec = $("#lead");
      if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );
  const form = $("#lead-form");
  if (form) {
    if (!SITE.leadUrl) {
      form.hidden = true;
      const note = document.createElement("p");
      note.className = "fine";
      note.textContent = SITE.buyUrl
        ? "Заявки и оплата — в Telegram. "
        : "Заявки и оплата временно принимаются в Telegram. Ссылка скоро появится.";
      if (SITE.buyUrl) {
        const a = document.createElement("a");
        a.href = SITE.buyUrl;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Написать в Telegram";
        note.appendChild(a);
      }
      form.parentNode.insertBefore(note, form);
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $("#lead-status");
      const name = ($("#lead-name")?.value || "").trim();
      const contact = ($("#lead-contact")?.value || "").trim();
      const plan = $("#lead-plan")?.value || "month";
      const comment = ($("#lead-comment")?.value || "").trim();
      const say = (text, ok) => {
        if (!status) return;
        status.textContent = text;
        status.style.color = ok ? "var(--ok)" : "var(--bad)";
      };
      if (!name || !contact) return say("Укажите имя и контакт", false);
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const r = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, contact, plan, comment }),
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        say("Заявка принята. Свяжемся с вами и пришлём счёт.", true);
        form.reset();
      } catch (err) {
        say("Не удалось отправить. Напишите на sales@svodka.local или попробуйте позже.", false);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }
})();
