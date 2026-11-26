/* «Сводка» — минимальная оболочка веб-редакции.
 * В Community не загружаются app.js и integrations.js, поэтому здесь только
 * модальные окна, уведомления и скрытие функций настольной версии. */
(function () {
  "use strict";
  const m = document.getElementById("modal");
  const tt = document.getElementById("modal-title");
  const bb = document.getElementById("modal-body");
  window.SVODKA_UI = {
    openModal: function (title, html) {
      if (!m) return;
      tt.textContent = title || "Сводка";
      bb.innerHTML = html || "";
      m.hidden = false;
    },
    closeModal: function () {
      if (!m) return;
      m.hidden = true;
      if (bb) bb.innerHTML = "";
    },
    toast: function (t) {
      try {
        console.log(t);
      } catch (e) {}
    },
  };
  const close = document.getElementById("modal-close");
  if (close) close.addEventListener("click", function () { window.SVODKA_UI.closeModal(); });
  if (m) m.addEventListener("click", function (e) { if (e.target === m) window.SVODKA_UI.closeModal(); });
  function hide(sel) {
    document.querySelectorAll(sel).forEach(function (x) { x.style.display = "none"; });
  }
  hide("#ts-emp,#ts-add,#ts-imp,#ts-vac,#ts-cal,#ts-fi,#tpl");
  ["#onec-open", "#hh-open", "#cal-open"].forEach(function (sel) {
    const b = document.querySelector(sel);
    if (b) {
      const c = b.closest(".card");
      if (c) c.style.display = "none";
    }
  });
})();
