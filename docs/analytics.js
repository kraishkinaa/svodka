/* Обезличенная статистика лендинга. По умолчанию выключена.
 * Поддерживаются GoatCounter, Plausible и собственный сервис; персональные данные не отправляются. */
(function () {
  "use strict";
  const A = (window.SVODKA_SITE && window.SVODKA_SITE.analytics) || {};
  const provider = String(A.provider || "").toLowerCase();
  const site = String(A.site || A.domain || "").trim();
  const ownUrl = String(A.url || A.endpoint || "").replace(/\/+$/, "");
  const queue = [];
  let ready = false;

  function configured() {
    return provider === "own" ? !!(site && ownUrl) : !!(provider && site);
  }
  function flush() {
    if (!ready) return;
    while (queue.length) {
      const e = queue.shift();
      try {
        if (provider === "own" && typeof window.svodkaTrack === "function") {
          window.svodkaTrack(e);
        } else if (provider === "goatcounter" && window.goatcounter && window.goatcounter.count) {
          window.goatcounter.count({ path: location.pathname, title: e, event: true });
        } else if (provider === "plausible" && typeof window.plausible === "function") {
          window.plausible(e);
        }
      } catch (err) {}
    }
  }

  if (provider === "own" && configured()) {
    const s = document.createElement("script");
    s.defer = true;
    s.src = ownUrl + "/t.js";
    s.setAttribute("data-site", site);
    s.setAttribute("data-endpoint", ownUrl + "/collect");
    s.onload = () => {
      ready = true;
      flush();
    };
    document.head.appendChild(s);
  } else if (provider === "goatcounter" && site) {
    const host = site.replace(/^https?:\/\//, "").replace(/\/+$/, "").replace(/\/count$/, "");
    const endpoint = host.indexOf(".") >= 0 ? "https://" + host + "/count" : "https://" + host + ".goatcounter.com/count";
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", endpoint);
    s.onload = () => {
      ready = true;
      flush();
    };
    document.head.appendChild(s);
  } else if (provider === "plausible" && site) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://plausible.io/js/script.js";
    s.setAttribute("data-domain", site);
    s.onload = () => {
      ready = true;
      flush();
    };
    document.head.appendChild(s);
  }

  window.SVODKA_ANALYTICS = {
    track: function (event) {
      const name = String(event || "").trim().slice(0, 80);
      if (!name || !configured()) return;
      if (!ready) {
        if (queue.length < 30) queue.push(name);
        return;
      }
      queue.push(name);
      flush();
    },
    enabled: function () {
      return configured();
    },
  };
})();
