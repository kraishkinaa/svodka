/* Режим «Демо» для веб-версии: только топовые виджеты, обучение и загрузка Excel.
 * Запускается по адресу /demo/?showcase=1. */
(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  if (!params.has("showcase")) return;
  const $ = (s) => document.querySelector(s);
  const TOP = ["kpi", "forecast", "heat", "vac", "src", "cost", "complete"];
  const embed = params.has("embed");
  let started = false;

  function track(event) {
    try {
      if (window.SVODKA_ANALYTICS) window.SVODKA_ANALYTICS.track(event);
      if (window.parent && window.parent !== window) window.parent.postMessage({ type: "svodka-track", event: event }, "*");
    } catch (e) {}
  }

  function icon() {
    return '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="15" y="3" width="8" height="5" rx="2"/><rect x="3" y="15" width="8" height="8" rx="2"/><rect x="15" y="12" width="8" height="11" rx="2"/></svg>';
  }
  function actionIcon(name) {
    const paths = {
      upload: '<path d="M12 16V4m-4 4 4-4 4 4"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
      learn: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
      download: '<path d="M12 4v11m-4-4 4 4 4-4"/><path d="M5 16v4h14v-4"/>',
      shield: '<path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  function buildBar() {
    if ($(".showcase-bar")) return;
    const bar = document.createElement("div");
    bar.className = "showcase-bar";
    bar.innerHTML =
      '<div class="showcase-brand"><span class="showcase-mark">' + icon() + "</span><b>Сводка</b><span class=\"showcase-demo-label\">демо</span></div>" +
      '<div class="showcase-actions"><button type="button" class="p" id="showcase-upload">' + actionIcon("upload") + "<span>Загрузить Excel</span></button>" +
      '<button type="button" id="showcase-tour">' + actionIcon("learn") + "<span>Узнать больше</span></button>" +
      '<span id="showcase-status" class="showcase-status">Данные не нужно вводить вручную</span>' +
      '<button type="button" id="showcase-cta">' + actionIcon("download") + "<span>Скачать Desktop</span></button></div>" +
      '<input type="file" id="showcase-file" accept=".xlsx,.xls,.csv" hidden>' +
      '<div class="showcase-privacy" id="showcase-privacy">' + actionIcon("shield") + "<span>Файл читается в браузере. ФИО, почта и телефон заменяются на обезличенные; на сервер ничего не отправляется.</span></div>";
    document.body.insertBefore(bar, document.body.firstChild);
    $("#showcase-upload")?.addEventListener("click", () => $("#showcase-file")?.click());
    $("#showcase-file")?.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) anonymizeAndLoad(f);
    });
    $("#showcase-cta")?.addEventListener("click", () => {
      track("desktop_click");
      if (embed) {
        if (window.parent && window.parent !== window) window.parent.postMessage({ type: "svodka-scroll", target: "download" }, "*");
        else window.location.hash = "download";
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "svodka-demo-close", scroll: "download" }, "*");
      } else window.location.hash = "download";
    });
  }

  function headerInfo(rows) {
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
      const r = rows[i] || [];
      let fio = -1, email = -1, phone = -1;
      r.forEach((c, j) => {
        const s = String(c || "");
        if (fio < 0 && /фио|фамил|имя|сотрудник/i.test(s)) fio = j;
        if (email < 0 && /почт|e-?mail/i.test(s)) email = j;
        if (phone < 0 && /телефон|мобил|^тел/i.test(s)) phone = j;
      });
      if (fio >= 0) return { row: i, fio: fio, email: email, phone: phone };
    }
    return null;
  }

  async function anonymizeAndLoad(file) {
    const status = $("#showcase-status");
    const say = (text, bad) => {
      if (!status) return;
      status.textContent = text;
      status.style.color = bad ? "var(--bad)" : "var(--muted)";
    };
    if (typeof XLSX === "undefined") return say("Не загрузилась библиотека Excel", true);
    if (file.size > 25 * 1024 * 1024) return say("Файл больше 25 МБ", true);
    try {
      const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array", cellDates: true });
      const tabs = wb.SheetNames.map((n) => ({
        n: n,
        a: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: "" }),
      }));
      const names = new Map();
      let count = 0;
      tabs.forEach((t) => {
        const h = headerInfo(t.a);
        if (!h) return;
        for (let i = h.row + 1; i < t.a.length; i++) {
          const row = t.a[i];
          if (!row) continue;
          const name = String(row[h.fio] || "").trim();
          if (!name) continue;
          if (!names.has(name)) names.set(name, "Сотрудник " + (names.size + 1));
          row[h.fio] = names.get(name);
          if (h.email >= 0) row[h.email] = "";
          if (h.phone >= 0) row[h.phone] = "";
          count++;
        }
      });
      if (!count) return say("Не нашёл колонку ФИО. Загрузите файл со списком сотрудников.", true);
      await window.SVODKA_APP.ingestTabs(tabs, "демо-файл (обезличен)");
      say("Загружено строк: " + count + ". ФИО, почта и телефон обезличены. Данные остались в браузере.", false);
      track("excel_upload");
    } catch (e) {
      say("Не удалось прочитать файл: " + (e.message || e), true);
    }
  }

  const STEPS = [
    { sel: '#g .c[data-id="kpi"]', title: "Ключевые цифры", text: "Численность, текучесть, принятые и уволенные — главное за выбранный период. Всё считается из загруженного файла." },
    { sel: '#g .c[data-id="forecast"]', title: "Прогноз текучести и численности", text: "Линейный тренд по последним 12 месяцам. Это оценка, а не гарантия; она помогает заранее увидеть риск." },
    { sel: '#g .c[data-id="heat"]', title: "Тепловая карта отпусков", text: "Видно, когда в подразделениях одновременно отдыхает слишком много людей. Нажмите на месяц — появится подсказка." },
    { sel: '#g .c[data-id="vac"]', title: "График отпусков", text: "Ближайшие три месяца по каждому сотруднику. Пересечения отпусков в одном отделе подсвечиваются." },
    { sel: '#g .c[data-id="src"]', title: "Источники кандидатов", text: "Отклики, выходы, расходы и стоимость выхода по каналам. Наглядно видно, какой источник приносит людей." },
    { sel: '#g .c[data-id="cost"]', title: "Стоимость найма и замены", text: "Сколько стоит закрыть вакансию и заменить сотрудника. Можно менять поля и сразу видеть результат." },
    { sel: '#g .c[data-id="complete"]', title: "Укомплектованность подразделений", text: "Где штат закрыт, а где не хватает людей. Данные берутся из штатного расписания и списка сотрудников." },
    { sel: '#showcase-upload', title: "Excel вместо ручного ввода", text: "Прикрепите файл — приложение само разберёт колонки и пересчитает виджеты. В демо можно загрузить свой обезличенный файл." },
    { sel: '#showcase-privacy', title: "Данные остаются у вас", text: "Файл читается в браузере. ФИО, почта и телефон заменяются на обезличенные. На сервер ничего не отправляется." },
  ];
  let index = 0, timer = null, open = false;

  function place() {
    if (!open) return;
    const step = STEPS[index];
    const target = step && document.querySelector(step.sel);
    if (!target) {
      if (index < STEPS.length - 1) { index++; place(); } else stop(); 
      return;
    }
    try { target.scrollIntoView({ block: "center", inline: "center" }); } catch (e) {}
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!open) return;
      const r = target.getBoundingClientRect();
      const hole = $("#tour-hole"), card = $("#tour-card");
      if (!hole || !card) return;
      const pad = 6;
      hole.style.left = Math.max(2, r.left - pad) + "px";
      hole.style.top = Math.max(2, r.top - pad) + "px";
      hole.style.width = Math.max(14, Math.min(window.innerWidth - 4, r.width + pad * 2)) + "px";
      hole.style.height = Math.max(14, Math.min(window.innerHeight - 4, r.height + pad * 2)) + "px";
      $("#tour-step").textContent = index + 1 + " из " + STEPS.length;
      $("#tour-title").textContent = step.title;
      $("#tour-text").textContent = step.text;
      $("#tour-prev").disabled = index === 0;
      $("#tour-next").textContent = index === STEPS.length - 1 ? "Готово" : "Дальше";
      const next = $("#tour-next");
      let up = $("#tour-upload");
      if (index === 7) {
        if (!up && next) {
          up = document.createElement("button");
          up.type = "button";
          up.id = "tour-upload";
          up.className = "p";
          up.textContent = "Загрузить Excel";
          up.addEventListener("click", () => {
            track("excel_upload_start");
            $("#showcase-file")?.click();
          });
          next.parentNode.insertBefore(up, next);
        }
      } else if (up) {
        up.remove();
      }
      const cw = Math.min(340, window.innerWidth - 24), cardH = card.offsetHeight || 170;
      const below = r.bottom + 16, putBelow = below + cardH < window.innerHeight - 8;
      const top = putBelow ? below : Math.max(10, r.top - cardH - 16);
      const left = Math.max(12, Math.min(window.innerWidth - cw - 12, r.left + r.width / 2 - cw / 2));
      card.style.width = cw + "px";
      card.classList.toggle("below", putBelow);
      card.classList.toggle("above", !putBelow);
      card.style.left = left + "px";
      card.style.top = top + "px";
      card.style.setProperty("--ax", Math.max(20, Math.min(cw - 34, r.left + r.width / 2 - left - 7)) + "px");
    }, 60);
  }
  function go(i) {
    index = Math.max(0, Math.min(STEPS.length - 1, i));
    place();
  }
  function start() {
    const t = $("#tour");
    if (!t) return;
    open = true;
    t.hidden = false;
    index = 0;
    setTimeout(place, 120);
  }
  function stop() {
    open = false;
    const t = $("#tour");
    if (t) t.hidden = true;
  }
  function finish() {
    track("demo_finished");
    stop();
    if (!embed && window.parent && window.parent !== window) window.parent.postMessage({ type: "svodka-demo-close", scroll: "download" }, "*");
  }

  function init() {
    if (started) return;
    if (!window.SVODKA_APP || !document.querySelector('#g .c[data-id="kpi"]')) {
      setTimeout(init, 200);
      return;
    }
    started = true;
    document.body.classList.add("showcase-mode");
    buildBar();
    try {
      st.edit = false;
      st.pick = 0;
      st.q = "";
      st.order = TOP.slice();
      st.hide = Object.keys(WG).filter((id) => TOP.indexOf(id) < 0);
      ROLED.role = "hrd";
      draw();
    } catch (e) {}
    $("#tour-skip")?.addEventListener("click", stop);
    $("#tour-prev")?.addEventListener("click", () => go(index - 1));
    $("#tour-next")?.addEventListener("click", () => (index >= STEPS.length - 1 ? finish() : go(index + 1)));
    $("#showcase-tour")?.addEventListener("click", () => {
      if (!embed) track("demo_tour");
      index = 0;
      start();
    });
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "svodka-tour-start") {
        index = 0;
        start();
      }
    });
    if (!embed) setTimeout(start, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
