/**
 * mockup.js — wall mockup feature: pet photo upload, composited on top of a
 * real living-room photo that swaps per selected size (config.sizes[].wallImage
 * + wallCanvas), plus rotate/light controls. Kept in sync with FactoriaState.
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
    const wall = document.getElementById("mockup-wall");
    if (!wall) return;
    wall.style.transform = `rotateY(${ROTATION_ANGLES[rotationIndex]}deg)`;
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

  // El marco y su color ya vienen fotografiados dentro de cada wallImage
  // (una foto real de living por tamaño) — lo único que cambia por selección
  // es CUÁL de esas 3 fotos se muestra, y dónde se superpone la foto que
  // sube el cliente (wallCanvas, medido a mano sobre cada foto).
  function findSizeConfig(sizeId) {
    const cfg = getConfig();
    if (!cfg || !sizeId) return null;
    return cfg.sizes.find((s) => s.id === sizeId) || (cfg.sizesExtra || []).find((s) => s.id === sizeId) || null;
  }

  function syncWallForSize(sizeId) {
    const wall = document.getElementById("mockup-wall");
    const photoArea = document.getElementById("mockup-photo-area");
    const hint = document.getElementById("mockup-size-hint");
    if (!wall || !photoArea) return;

    const size = findSizeConfig(sizeId);
    if (!size || !size.wallImage || !size.wallCanvas) {
      wall.style.backgroundImage = "";
      wall.classList.add("is-empty");
      if (hint) hint.hidden = true;
      return;
    }

    wall.classList.remove("is-empty");
    wall.style.backgroundImage = `url("${size.wallImage}")`;
    const c = size.wallCanvas;
    photoArea.style.left = c.left + "%";
    photoArea.style.top = c.top + "%";
    photoArea.style.width = c.width + "%";
    photoArea.style.height = c.height + "%";

    if (hint) {
      hint.textContent = `Así se ve a escala real el tamaño ${size.label} (${size.dims})`;
      hint.hidden = false;
    }
  }

  function syncFromSelection(selection) {
    if (!selection) return;
    syncWallForSize(selection.size);
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
