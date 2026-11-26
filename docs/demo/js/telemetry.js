/* Обезличенная телеметрия «Сводки».
 * По умолчанию выключена. Согласие спрашивается при первом запуске, затем
 * напоминания: 7 дней, 7 дней, 7 дней и далее раз в 180 дней.
 * Передаются только события из allowlist; персональные данные не собираются. */
(function () {
  "use strict";
  const API = window.svodka || null;
  if (!API || !API.isDesktop || !API.telemetry) return;
  if (API.isSmoke) return;
  if ((window.SVODKA_EDITION || "desktop") === "community") return;

  const KEY = "svodka_telemetry";
  const WEEK = 7 * 864e5;
  const HALF_YEAR = 180 * 864e5;
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    state = {};
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }
  function osMajor() {
    const m = String(navigator.userAgent || "").match(/Windows NT (\d+)/);
    return m ? m[1] : "0";
  }
  function version() {
    const v = String((API && API.version) || "0.0").replace(/[^0-9.]/g, "");
    return /^\d{1,3}(\.\d{1,3}){1,3}$/.test(v) ? v : "0.0";
  }

  const queue = [];
  let timer = null;
  let started = false;

  function appStart() {
    if (started) return;
    started = true;
    track("app_start", { edition: window.SVODKA_EDITION || "desktop", version: version(), osMajor: osMajor() });
  }
  function track(name, props) {
    if (!state.allowed) return;
    if (queue.length >= 100) queue.shift();
    queue.push({ name: name, props: props || {} });
    schedule();
  }
  function schedule() {
    if (timer) return;
    timer = setTimeout(flush, 30000);
  }
  async function flush() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!state.allowed || !queue.length) return;
    const events = queue.splice(0, 50);
    try {
      const r = await API.telemetry.send({ events: events });
      if (r && r.skipped) return;
    } catch (e) {
      /* сеть недоступна: не копим бесконечно */
    }
  }

  function setAllowed(allowed) {
    state.allowed = !!allowed;
    state.decidedAt = Date.now();
    state.askedAt = state.askedAt || Date.now();
    if (!allowed) {
      state.count = Math.max(3, state.count || 0);
      state.nextAskAt = Date.now() + HALF_YEAR;
    } else {
      state.count = state.count || 0;
      state.nextAskAt = 0;
    }
    save();
    if (!allowed) {
      queue.length = 0;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    } else {
      appStart();
    }
  }
  function decline() {
    state.askedAt = state.askedAt || Date.now();
    state.count = (state.count || 0) + 1;
    state.nextAskAt = Date.now() + (state.count >= 3 ? HALF_YEAR : WEEK);
    state.decidedAt = Date.now();
    save();
  }
  function consentNeeded() {
    if (state.allowed) return false;
    /* Показ без ответа не должен откладывать вопрос: спрашиваем при следующем запуске. */
    if (!state.decidedAt) return true;
    if (state.nextAskAt && Date.now() < state.nextAskAt) return false;
    return true;
  }

  function showConsent() {
    if (document.getElementById("telemetry-consent")) return;
    const el = document.createElement("div");
    el.id = "telemetry-consent";
    el.className = "telemetry-consent";
    el.innerHTML =
      '<div><b>Помогите улучшить «Сводку»</b><p>Разрешить сбор обезличенной статистики? Передаются только названия открытых виджетов, версия, редакция, тип тарифа и период анализа. ФИО, почта, телефоны, зарплаты, названия организаций и содержимое Excel не отправляются. Решение можно изменить в настройках.</p></div>' +
      '<div class="tc-actions"><button type="button" class="p" data-tc="yes">Разрешить</button><button type="button" data-tc="no">Не разрешать</button></div>';
    document.body.appendChild(el);
    state.askedAt = state.askedAt || Date.now();
    save();
    el.querySelector('[data-tc="yes"]').onclick = function () {
      setAllowed(true);
      el.remove();
    };
    el.querySelector('[data-tc="no"]').onclick = function () {
      decline();
      el.remove();
    };
  }

  /* Не перекрываем обязательные окна: пароль восстановления, тариф, лицензию,
   * тур и обычные диалоги. После закрытия окна вопрос появится сам. */
  function blockedByOverlay() {
    if (document.hidden) return true;
    for (const sel of ["#storage-gate", "#trial-gate", "#license-gate", "#tour", "#modal"]) {
      const el = document.querySelector(sel);
      if (el && !el.hidden) return true;
    }
    return false;
  }
  let askTries = 0;
  function tryShowConsent() {
    if (!consentNeeded()) {
      if (state.allowed) appStart();
      return;
    }
    if (blockedByOverlay()) {
      if (++askTries < 150) setTimeout(tryShowConsent, 2000);
      return;
    }
    showConsent();
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest && e.target.closest("#ts-fill,#ts-exp,#ts-prt,#ts-demo");
    if (t) {
      const action = t.id === "ts-fill" ? "fill" : t.id === "ts-exp" ? "export" : t.id === "ts-prt" ? "print" : "demo";
      track("timesheet_use", { action: action });
    }
  });
  document.addEventListener("change", function (e) {
    if (!e.target) return;
    if (e.target.id === "per") {
      track("filter_use", { dimension: "period" });
      const months = Number(e.target.value);
      if ([1, 3, 6, 9, 12].includes(months)) track("analytics_period", { months: months });
    } else if (e.target.id === "ts-fd") {
      track("filter_use", { dimension: "dept" });
    } else if (e.target.matches && e.target.matches("select[data-vf]")) {
      track("filter_use", { dimension: "vacancy" });
    }
  });
  window.addEventListener("beforeunload", function () {
    if (state.allowed && queue.length) flush();
  });

  setTimeout(tryShowConsent, 1800);

  window.SVODKA_TELEMETRY = {
    track: track,
    setAllowed: setAllowed,
    status: function () {
      return { allowed: !!state.allowed, askedAt: state.askedAt || 0, count: state.count || 0, nextAskAt: state.nextAskAt || 0 };
    },
    flush: flush,
  };
})();
