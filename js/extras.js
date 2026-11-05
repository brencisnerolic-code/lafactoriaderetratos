/**
 * extras.js — Fase 2: aviso de Navidad, seña y saldo, fecha de entrega en
 * días hábiles, "Incluye", y elementos opcionales apagados por defecto
 * (sello de Google, vigencia de precios, certificado).
 *
 * Toda la configuración sale de window.FACTORIA_CONFIG (js/config.js).
 * Depende de i18n.js, config.js y state.js (carga antes de este archivo).
 */
(function () {
  "use strict";

  var CFG = window.FACTORIA_CONFIG || {};
  var FLAGS = CFG.flags || {};
  var HOLIDAYS = {};
  (CFG.feriados || []).forEach(function (d) { HOLIDAYS[d] = true; });

  function $(id) { return document.getElementById(id); }

  function T(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  function lang() {
    return window.I18N && window.I18N.getLang ? window.I18N.getLang() : "es";
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function isoOf(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseISO(s) {
    var p = s.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function todayDate() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function isBusinessDay(d) {
    var wd = d.getDay();
    return wd !== 0 && wd !== 6 && !HOLIDAYS[isoOf(d)];
  }

  function addBusinessDays(from, n) {
    var d = new Date(from.getTime());
    var added = 0;
    while (added < n) {
      d.setDate(d.getDate() + 1);
      if (isBusinessDay(d)) added++;
    }
    return d;
  }

  function formatDate(d) {
    var locale = lang() === "en" ? "en-US" : "es-AR";
    return d
      .toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })
      .replace(",", "");
  }

  function money(n) {
    return "$ " + n.toLocaleString("es-AR") + " ARS";
  }

  function currentPrice() {
    if (!window.FactoriaState || typeof window.FactoriaState.getPrice !== "function") return null;
    var p = window.FactoriaState.getPrice();
    return p === undefined ? null : p;
  }

  // ---------- Aviso de Navidad (se oculta solo al vencer cada fecha) ----------

  function renderBanner() {
    var banner = $("holiday-banner");
    var text = $("holiday-banner-text");
    if (!banner || !text) return;

    if (FLAGS.MOSTRAR_AVISO_FECHAS === false) {
      banner.hidden = true;
      return;
    }

    var nav = CFG.navidad || {};
    var today = todayDate();
    var dom = nav.domicilioHasta ? parseISO(nav.domicilioHasta) : null;
    var ret = nav.retiroHasta ? parseISO(nav.retiroHasta) : null;
    var domOpen = !!dom && today <= dom;
    var retOpen = !!ret && today <= ret;
    var vars = {
      domicilio: dom ? formatDate(dom) : "",
      retiro: ret ? formatDate(ret) : ""
    };

    var msg = null;
    if (domOpen && retOpen) msg = T("banner_both", vars);
    else if (domOpen) msg = T("banner_domicilio", vars);
    else if (retOpen) msg = T("banner_retiro", vars);

    text.textContent = msg || "";
    banner.hidden = !msg;
  }

  // ---------- Resumen: seña, saldo y fecha de entrega ----------

  function renderDeposit(price) {
    var split = $("summary-split");
    if (!split) return;
    if (price === null) {
      split.hidden = true;
      return;
    }
    var pct = typeof CFG.depositPercent === "number" ? CFG.depositPercent : 50;
    var deposit = Math.round((price * pct) / 100);
    var dep = $("summary-deposit");
    var bal = $("summary-balance");
    if (dep) dep.textContent = money(deposit);
    if (bal) bal.textContent = money(price - deposit);
    split.hidden = false;
  }

  function renderDelivery(price) {
    var el = $("summary-delivery");
    if (!el) return;
    if (price === null) {
      el.hidden = true;
      return;
    }
    var prod = CFG.productionDays || { min: 10, max: 15 };
    var ship = CFG.shippingDays || { min: 5, max: 7 };
    var today = todayDate();
    el.textContent = T("delivery_text", {
      min: formatDate(addBusinessDays(today, prod.min)),
      minEnvio: formatDate(addBusinessDays(today, prod.min + ship.min)),
      maxEnvio: formatDate(addBusinessDays(today, prod.max + ship.max))
    });
    el.hidden = false;
  }

  // ---------- Flags opcionales ----------

  function renderOptionalFlags() {
    var validity = $("price-validity");
    if (validity) {
      if (FLAGS.MOSTRAR_VIGENCIA_PRECIOS && CFG.preciosVigentesHasta) {
        validity.textContent = T("price_validity", {
          fecha: formatDate(parseISO(CFG.preciosVigentesHasta))
        });
        validity.hidden = false;
      } else {
        validity.hidden = true;
      }
    }

    var cert = $("inc-cert");
    if (cert) cert.hidden = !FLAGS.MOSTRAR_CERTIFICADO;

    var seal = $("google-seal");
    var review = CFG.googleReview || {};
    if (seal) {
      if (review.score != null && review.count != null) {
        var suffix = lang() === "en" ? " reviews)" : " reseñas)";
        seal.textContent = "★ " + review.score + " (" + review.count + suffix;
        seal.hidden = false;
      } else {
        seal.hidden = true;
      }
    }
  }

  // ---------- Ciclo ----------

  function renderSummaryExtras() {
    var price = currentPrice();
    renderDeposit(price);
    renderDelivery(price);
  }

  function renderAll() {
    renderBanner();
    renderSummaryExtras();
    renderOptionalFlags();
  }

  function init() {
    renderAll();
    window.addEventListener("factoria:selection-change", renderSummaryExtras);
    window.addEventListener("factoria:lang-change", renderAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
