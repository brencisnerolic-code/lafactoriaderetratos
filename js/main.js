/**
 * main.js — La Factoría by Juana Perfecta
 * Global site behavior: nav, smooth scroll, FAQ accordion, gallery lightbox,
 * checkout form validation + WhatsApp handoff, header scroll state, footer year.
 *
 * Loads last (after config.js, state.js, mockup.js). Defensive: every DOM
 * lookup is guarded so a missing/late element never throws.
 */
(function () {
  "use strict";

  var T = window.I18N || { t: function (k) { return k; } };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  }

  // ---------- 1. Footer year ----------
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // ---------- 2. Mobile nav ----------
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.classList.remove("is-open");
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      var isOpen = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    toggle.addEventListener("click", toggleMenu);

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  // ---------- 3. Smooth scroll section flow ----------
  function initSmoothScroll() {
    var toMockup = document.getElementById("btn-to-mockup");
    var toCheckout = document.getElementById("btn-to-checkout");
    var backToConfig = document.getElementById("btn-back-to-config");

    if (toMockup) {
      toMockup.addEventListener("click", function () {
        smoothScrollTo(document.getElementById("mockup"));
      });
    }
    if (toCheckout) {
      toCheckout.addEventListener("click", function () {
        smoothScrollTo(document.getElementById("checkout"));
      });
    }
    if (backToConfig) {
      backToConfig.addEventListener("click", function () {
        smoothScrollTo(document.getElementById("configurador"));
      });
    }

    // Generic in-page anchor handler for header/footer nav + hero CTAs.
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href || href === "#") return;

      var targetId = href.slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      smoothScrollTo(target);
    });
  }

  // ---------- 4. FAQ accordion ----------
  function initFaqAccordion() {
    var questions = document.querySelectorAll(".faq-question");
    if (!questions.length) return;

    questions.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";

        questions.forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
        });

        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  // ---------- 5. Gallery lightbox ----------
  function initGalleryLightbox() {
    var lightbox = document.getElementById("lightbox");
    var closeBtn = document.getElementById("lightbox-close");
    var captionEl = document.getElementById("lightbox-caption");
    var imageEl = document.getElementById("lightbox-image");
    var content = lightbox ? lightbox.querySelector(".lightbox-content") : null;
    var items = document.querySelectorAll("#gallery-grid .gallery-item");
    if (!lightbox || !items.length) return;

    var lastTrigger = null;

    function openLightbox(item) {
      lastTrigger = item;

      if (captionEl) captionEl.textContent = item.getAttribute("data-caption") || "";

      var img = item.querySelector("img");
      if (imageEl) {
        if (img) {
          imageEl.src = img.src;
          imageEl.alt = img.alt || "";
          imageEl.hidden = false;
        } else {
          imageEl.hidden = true;
          imageEl.removeAttribute("src");
          imageEl.alt = "";
        }
      }

      lightbox.hidden = false;
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      if (lightbox.hidden) return;
      lightbox.hidden = true;
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
      lastTrigger = null;
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(item);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
      if (content && content.contains(event.target)) return;
      closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  // ---------- 6. Client form validation + WhatsApp checkout ----------
  function initCheckoutForm() {
    var form = document.getElementById("client-form");
    var submitBtn = document.getElementById("btn-whatsapp-checkout");
    var errorEl = document.getElementById("form-error");
    if (!form || !submitBtn) return;

    var nameInput = document.getElementById("client-name");
    var emailInput = document.getElementById("client-email");
    var phoneInput = document.getElementById("client-phone");
    var termsInput = document.getElementById("accept-terms");
    var petNameInput = document.getElementById("client-pet-name");
    var notesInput = document.getElementById("client-notes");

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    function hideError() {
      if (!errorEl) return;
      errorEl.hidden = true;
    }

    function isValid() {
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        if (typeof form.reportValidity === "function") form.reportValidity();
        return false;
      }
      if (nameInput && !nameInput.value.trim()) return false;
      if (phoneInput && !phoneInput.value.trim()) return false;
      if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) return false;
      if (termsInput && !termsInput.checked) return false;
      return true;
    }

    submitBtn.addEventListener("click", function () {
      if (
        typeof window.FactoriaState !== "undefined" &&
        typeof window.FactoriaState.isReadyForMockup === "function" &&
        !window.FactoriaState.isReadyForMockup()
      ) {
        showError(T.t("form_error_incomplete_config"));
        return;
      }

      if (!isValid()) {
        showError(T.t("form_error_required_fields"));
        return;
      }

      hideError();

      var clientData = {
        petName: petNameInput ? petNameInput.value.trim() : "",
        name: nameInput ? nameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        phone: phoneInput ? phoneInput.value.trim() : "",
        notes: notesInput ? notesInput.value.trim() : ""
      };

      var paymentSection = document.getElementById("payment-section");
      if (paymentSection) {
        paymentSection.hidden = false;
        smoothScrollTo(paymentSection);
      }

      if (window.FactoriaPayment && typeof window.FactoriaPayment.setClientData === "function") {
        window.FactoriaPayment.setClientData(clientData);
      }
    });
  }

  // ---------- 7. Header shrink on scroll ----------
  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    });

    update();
  }

  function init() {
    initFooterYear();
    initMobileNav();
    initSmoothScroll();
    initFaqAccordion();
    initGalleryLightbox();
    initCheckoutForm();
    initHeaderScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
