/* «Сводка» — точка входа редакции. Загружается первой, до модулей интерфейса.
 * Редакция задаётся в HTML: window.SVODKA_DESKTOP = true|false.
 * Коммерческие модули подключаются через SvodkaModules.register(), не меняя ядро. */
(function () {
  "use strict";
  const isDesktop = window.SVODKA_DESKTOP !== false;
  const edition = window.SVODKA_EDITION || (isDesktop ? "desktop" : "community");
  window.SVODKA_DESKTOP = edition === "desktop";
  window.SVODKA_EDITION = edition;

  const registry = Object.create(null);
  window.SvodkaModules = {
    edition: edition,
    register: function (name, mod) {
      if (!name || typeof name !== "string") throw new Error("Модуль: нужно имя");
      if (registry[name]) throw new Error("Модуль уже зарегистрирован: " + name);
      registry[name] = mod || {};
      return registry[name];
    },
    has: function (name) {
      return !!registry[name];
    },
    get: function (name) {
      return registry[name] || null;
    },
    names: function () {
      return Object.keys(registry);
    },
  };
})();
