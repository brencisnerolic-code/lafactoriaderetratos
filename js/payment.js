/**
 * payment.js — payment method selection: Mercado Pago (Checkout Pro redirect
 * via a Netlify Function that holds the secret Access Token) and bank
 * transfer (shows account details, copy buttons, WhatsApp receipt handoff).
 *
 * Depends on window.FACTORIA_CONFIG (config.js) and window.FactoriaState
 * (state.js), both loaded before this file. Exposes window.FactoriaPayment
 * so main.js can hand off clientData once the checkout form is valid.
 */
window.FactoriaPayment = (function () {
  "use strict";

  var T = window.I18N || { t: function (k) { return k; } };
  var clientData = null;
  var orderNumber = null;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function getConfig() {
    return window.FACTORIA_CONFIG || null;
  }

  function generateOrderNumber() {
    return "FAC-" + Date.now().toString().slice(-6);
  }

  function depositAmount() {
    var cfg = getConfig();
    if (!window.FactoriaState || typeof window.FactoriaState.getPrice !== "function" || !cfg) return null;
    var total = window.FactoriaState.getPrice();
    if (total === null || total === undefined) return null;
    var pct = typeof cfg.depositPercent === "number" ? cfg.depositPercent : 50;
    return Math.round((total * pct) / 100);
  }

  function formatARS(n) {
    if (n === null || n === undefined) return T.t("payment_amount_tbd");
    return "$ " + n.toLocaleString("es-AR") + " ARS";
  }

  function showPaymentError(message) {
    var el = $("payment-error");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
  }

  function hidePaymentError() {
    var el = $("payment-error");
    if (!el) return;
    el.hidden = true;
  }

  function updateTotalDisplay() {
    var el = $("payment-total-amount");
    if (!el) return;
    el.textContent = formatARS(depositAmount());
  }

  // ---------- Transfer modal ----------

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
  }

  function fillTransferModal() {
    var cfg = getConfig();
    if (!cfg || !cfg.bankTransfer) return;
    var amount = depositAmount();

    var banco = $("transfer-banco");
    var titular = $("transfer-titular");
    var cbu = $("transfer-cbu");
    var alias = $("transfer-alias");
    var amountEl = $("transfer-amount");
    var orderEl = $("transfer-order-number");

    if (banco) banco.textContent = cfg.bankTransfer.banco;
    if (titular) titular.textContent = cfg.bankTransfer.titular;
    if (cbu) cbu.textContent = cfg.bankTransfer.cbu;
    if (alias) alias.textContent = cfg.bankTransfer.alias;
    if (amountEl) amountEl.textContent = formatARS(amount);
    if (orderEl) orderEl.textContent = orderNumber;
  }

  function initTransferCopyButtons() {
    var buttons = document.querySelectorAll(".btn-copy[data-copy-target]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-copy-target");
        var target = $(targetId);
        if (!target || !navigator.clipboard) return;
        navigator.clipboard.writeText(target.textContent.trim()).then(function () {
          var originalLabel = btn.textContent;
          btn.textContent = T.t("payment_copied");
          setTimeout(function () {
            btn.textContent = originalLabel;
          }, 1500);
        });
      });
    });
  }

  function buildTransferWhatsAppUrl() {
    var cfg = getConfig();
    if (!cfg || !cfg.brand) return null;
    var amount = formatARS(depositAmount());
    var name = clientData && clientData.name ? clientData.name : "";
    var email = clientData && clientData.email ? clientData.email : "";

    var lines = [
      "¡Hola! Acabo de hacer una transferencia por " + amount + " para mi retrato de mascota.",
      "",
      "Orden: #" + orderNumber,
      "Nombre: " + name,
      "Email: " + email,
      "",
      "Les mando el comprobante a continuación."
    ];

    var message = encodeURIComponent(lines.join("\n"));
    return "https://wa.me/" + cfg.brand.whatsappNumber + "?text=" + message;
  }

  // ---------- Mercado Pago ----------

  function setButtonLoading(btn, isLoading, loadingText) {
    if (!btn) return;
    if (isLoading) {
      btn.dataset.originalContent = btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      var descEl = btn.querySelector(".payment-method-desc");
      if (descEl) descEl.textContent = loadingText;
    } else {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      if (btn.dataset.originalContent) {
        btn.innerHTML = btn.dataset.originalContent;
      }
    }
  }

  function payWithMercadoPago() {
    var cfg = getConfig();
    var btn = $("btn-pay-mercadopago");
    var amount = depositAmount();

    hidePaymentError();

    if (!cfg || !amount) {
      showPaymentError(T.t("payment_error_no_amount"));
      return;
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", "mercadopago_click", {
        order_id: orderNumber,
        value: amount,
        currency: "ARS"
      });
    }

    // Mercado Pago necesita la Netlify Function (/.netlify/functions/create-preference),
    // que solo existe una vez que el sitio está publicado en Netlify. Abriendo el
    // archivo local (file://) o probando con un servidor estático simple, ese endpoint
    // no existe y fetch() falla siempre con "Failed to fetch" — no es un error real de MP.
    if (window.location.protocol === "file:") {
      showPaymentError(T.t("payment_error_file_protocol"));
      return;
    }

    setButtonLoading(btn, true, T.t("payment_connecting_mp"));

    var body = {
      title: "Seña 50% — Retrato de mascota (" + orderNumber + ")",
      unitPrice: amount,
      quantity: 1,
      externalReference: orderNumber,
      siteUrl: window.location.origin,
      payer: {
        name: clientData ? clientData.name : "",
        email: clientData ? clientData.email : "",
        phone: clientData ? clientData.phone : ""
      }
    };

    fetch(cfg.payment.createPreferenceEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || T.t("payment_error_unknown_mp"));
          return data;
        });
      })
      .then(function (data) {
        if (!data.initPoint) throw new Error(T.t("payment_error_no_link"));
        try {
          sessionStorage.setItem("factoria_order_amount_" + orderNumber, String(amount));
        } catch (e) {}
        window.location.href = data.initPoint;
      })
      .catch(function (err) {
        setButtonLoading(btn, false);
        showPaymentError(
          T.t("payment_error_mp_generic_prefix") + err.message + T.t("payment_error_mp_generic_suffix")
        );
      });
  }

  // ---------- init ----------

  function init() {
    var mpBtn = $("btn-pay-mercadopago");
    var transferBtn = $("btn-pay-transfer");
    var modalTransfer = $("modal-transfer");
    var closeTransferBtn = $("btn-close-transfer");
    var confirmTransferBtn = $("btn-confirm-transfer");

    if (mpBtn) {
      mpBtn.addEventListener("click", function () {
        if (!orderNumber) orderNumber = generateOrderNumber();
        payWithMercadoPago();
      });
    }

    if (transferBtn) {
      transferBtn.addEventListener("click", function () {
        if (!orderNumber) orderNumber = generateOrderNumber();
        hidePaymentError();
        fillTransferModal();
        openModal(modalTransfer);
      });
    }

    if (closeTransferBtn) {
      closeTransferBtn.addEventListener("click", function () {
        closeModal(modalTransfer);
      });
    }

    if (modalTransfer) {
      modalTransfer.addEventListener("click", function (e) {
        if (e.target === modalTransfer) closeModal(modalTransfer);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalTransfer && !modalTransfer.hidden) closeModal(modalTransfer);
    });

    if (confirmTransferBtn) {
      confirmTransferBtn.addEventListener("click", function () {
        var url = buildTransferWhatsAppUrl();
        if (url) {
          if (typeof window.gtag === "function") {
            window.gtag("event", "whatsapp_click", { source: "transfer_confirm", order_id: orderNumber });
          }
          window.open(url, "_blank", "noopener");
        }
      });
    }

    initTransferCopyButtons();

    window.addEventListener("factoria:lang-change", function () {
      updateTotalDisplay();
      var modal = $("modal-transfer");
      if (modal && !modal.hidden) fillTransferModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    setClientData: function (data) {
      clientData = data;
      orderNumber = generateOrderNumber();
      updateTotalDisplay();
    }
  };
})();
