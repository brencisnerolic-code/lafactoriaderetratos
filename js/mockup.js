/**
 * mockup.js — wall mockup feature: pet photo upload + compositing into the
 * frame preview (rotate/light controls), kept in sync with FactoriaState.
 *
 * Depends on window.FACTORIA_CONFIG (config.js) and window.FactoriaState
 * (state.js), both loaded before this file.
 */
(function () {
  const ROTATION_ANGLES = [-15, 0, 15];
  let rotationIndex = ROTATION_ANGLES.indexOf(0);
  let currentObjectUrl = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function getConfig() {
    return window.FACTORIA_CONFIG || null;
  }

  // ---------- dropzone / upload ----------

  function showError(message) {
    const errorEl = document.getElementById("dropzone-error");
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    const errorEl = document.getElementById("dropzone-error");
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  function validateFile(file) {
    const cfg = getConfig();
    if (!cfg) return false;
    if (!cfg.acceptedUploadTypes.includes(file.type)) {
      showError("Solo se aceptan archivos JPG o PNG.");
      return false;
    }
    const maxBytes = cfg.maxUploadMB * 1024 * 1024;
    if (file.size > maxBytes) {
      showError(`El archivo supera los ${cfg.maxUploadMB}MB. Probá con una foto más liviana.`);
      return false;
    }
    return true;
  }

  function handleFile(file) {
    if (!file) return;
    if (!validateFile(file)) return;

    const img = document.getElementById("mockup-pet-image");
    const placeholder = document.getElementById("mockup-placeholder");
    if (!img) return;

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }

    const objectUrl = URL.createObjectURL(file);
    currentObjectUrl = objectUrl;

    img.src = objectUrl;
    img.alt = "Vista previa de tu mascota en el retrato";
    img.hidden = false;
    if (placeholder) placeholder.hidden = true;

    clearError();
  }

  function initDropzone() {
    const dropzone = document.getElementById("mockup-dropzone");
    const fileInput = document.getElementById("mockup-file-input");
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      handleFile(file);
      fileInput.value = "";
    });

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("is-dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("is-dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-dragover");
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file);
    });
  }

  // ---------- rotate / lighting controls ----------

  function applyRotation() {
    const frame = document.getElementById("mockup-frame");
    if (!frame) return;
    frame.style.transform = `rotateY(${ROTATION_ANGLES[rotationIndex]}deg)`;
  }

  function initControls() {
    const rotateLeftBtn = document.getElementById("btn-rotate-left");
    const rotateRightBtn = document.getElementById("btn-rotate-right");
    const lightBtn = document.getElementById("btn-toggle-light");
    const wall = document.getElementById("mockup-wall");

    if (rotateLeftBtn) {
      rotateLeftBtn.addEventListener("click", () => {
        rotationIndex = Math.max(0, rotationIndex - 1);
        applyRotation();
      });
    }

    if (rotateRightBtn) {
      rotateRightBtn.addEventListener("click", () => {
        rotationIndex = Math.min(ROTATION_ANGLES.length - 1, rotationIndex + 1);
        applyRotation();
      });
    }

    if (lightBtn && wall) {
      lightBtn.addEventListener("click", () => {
        wall.classList.toggle("is-dim");
      });
    }

    applyRotation();
  }

  // ---------- sync with FactoriaState ----------

  function syncFromSelection(selection) {
    if (!selection) return;
    const frameEl = document.getElementById("mockup-frame");
    const innerEl = $(".mockup-frame-inner");
    const cfg = getConfig();
    if (!frameEl) return;

    if (selection.frame) {
      frameEl.setAttribute("data-frame", selection.frame);
    }

    if (selection.frameColor) {
      frameEl.setAttribute("data-frame-color", selection.frameColor);
      if (frameEl && cfg) {
        const frameColor = cfg.frameColors.find((c) => c.id === selection.frameColor);
        if (frameColor && frameColor.hex) {
          frameEl.style.setProperty("--mockup-frame-color", frameColor.hex);
        } else {
          frameEl.style.removeProperty("--mockup-frame-color");
        }
      }
    }
  }

  function initStateSync() {
    window.addEventListener("factoria:selection-change", (e) => {
      syncFromSelection(e.detail);
    });

    if (window.FactoriaState && window.FactoriaState.selection) {
      syncFromSelection(window.FactoriaState.selection);
    }
  }

  // ---------- init ----------

  function init() {
    initDropzone();
    initControls();
    initStateSync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
