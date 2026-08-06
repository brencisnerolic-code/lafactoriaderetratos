/**
 * FactoriaState — single source of truth for the configurator selection,
 * live pricing and the WhatsApp order summary.
 *
 * Public API (consumed by mockup.js and main.js):
 *   FactoriaState.selection                        -> { size, frame, bg, merch, customBgLabel }
 *   FactoriaState.setSize(id) / setFrame(id) / setBg(id, customLabel?) / setMerch(id)
 *   FactoriaState.getPrice()                        -> number (ARS) or null if incomplete
 *   FactoriaState.getLabels()                       -> { sizeLabel, frameLabel, bgLabel, merchLabel }
 *   FactoriaState.isFrameAvailable(frameId, sizeId)  -> boolean
 *   FactoriaState.isReadyForMockup()                 -> boolean (size + frame + bg chosen)
 *   FactoriaState.buildWhatsAppMessage(clientData)   -> string (plain text, ready to encodeURIComponent)
 *   FactoriaState.buildWhatsAppUrl(clientData)       -> string (full https://wa.me/... link)
 *
 * Event fired on every change (window level), detail = current selection:
 *   window.addEventListener('factoria:selection-change', (e) => { ... })
 *
 * DOM contract this file owns/renders into:
 *   #step-size  .size-options   -> one .size-card[data-size] button per config.sizes
 *   #step-frame .frame-options  -> one .frame-card[data-frame] button per config.frames
 *   #step-bg    .bg-options     -> one .color-swatch[data-bg] button per config.bgColors
 *   #step-merch .merch-options  -> one .merch-card[data-merch] button per config.merch
 *   #summary-size / #summary-frame / #summary-bg / #summary-merch / #summary-total
 *   #btn-to-mockup -> disabled until isReadyForMockup()
 */
(function () {
  const CFG = window.FACTORIA_CONFIG;

  const selection = {
    size: null,
    frame: null,
    frameColor: null,
    customFrameColorLabel: "",
    merchAddons: []
  };

  function findSize(id) {
    return CFG.sizes.find((s) => s.id === id) || CFG.sizesExtra.find((s) => s.id === id);
  }
  function findFrame(id) {
    return CFG.frames.find((f) => f.id === id);
  }
  function findFrameColor(id) {
    return CFG.frameColors.find((c) => c.id === id);
  }
  function findMerchItem(id) {
    return CFG.merchItems.find((m) => m.id === id);
  }
  function getFreeMerchIds(sizeId) {
    return (sizeId && CFG.merchFreeBySize[sizeId]) || [];
  }
  function isMerchFree(id, sizeId) {
    return getFreeMerchIds(sizeId).includes(id);
  }

  function isFrameAvailable(frameId, sizeId) {
    const frame = findFrame(frameId);
    if (!frame) return false;
    if (frame.availableFor === "all") return true;
    return Array.isArray(frame.availableFor) && frame.availableFor.includes(sizeId);
  }

  function emitChange() {
    window.dispatchEvent(new CustomEvent("factoria:selection-change", { detail: { ...selection } }));
    renderSummary();
  }

  // ---------- setters ----------

  function setSize(id) {
    selection.size = id;
    // El marco renacentista solo existe para "mediano" (35x50) — si ya no aplica, se resetea.
    if (selection.frame && !isFrameAvailable(selection.frame, id)) {
      selection.frame = null;
    }
    // Ítems que ahora vienen gratis con el nuevo tamaño salen de la lista paga
    // (ya están incluidos, no hace falta seguir cobrándolos como addon).
    const free = getFreeMerchIds(id);
    selection.merchAddons = selection.merchAddons.filter((m) => !free.includes(m));
    renderFrameOptions();
    renderMerchOptions();
    syncActiveStates();
    emitChange();
  }

  function setFrame(id) {
    if (!isFrameAvailable(id, selection.size)) return;
    selection.frame = id;
    syncActiveStates();
    emitChange();
  }

  function setFrameColor(id, customLabel) {
    selection.frameColor = id;
    selection.customFrameColorLabel = id === "otro" ? customLabel || "" : "";
    syncActiveStates();
    emitChange();
  }

  function toggleMerchAddon(id) {
    const item = findMerchItem(id);
    if (!item) return;
    if (isMerchFree(id, selection.size)) return; // ya incluido gratis, no hace falta "agregar"
    const idx = selection.merchAddons.indexOf(id);
    if (idx === -1) {
      selection.merchAddons.push(id);
    } else {
      selection.merchAddons.splice(idx, 1);
    }
    syncActiveStates();
    emitChange();
  }

  // ---------- pricing ----------

  function getMerchTotal() {
    const free = getFreeMerchIds(selection.size);
    return selection.merchAddons.reduce((sum, id) => {
      if (free.includes(id)) return sum; // incluido gratis, no se cobra
      const item = findMerchItem(id);
      return item ? sum + item.price : sum;
    }, 0);
  }

  function getPrice() {
    const size = findSize(selection.size);
    const frame = findFrame(selection.frame);
    if (!size || !frame) return null;
    // priceAdd === null significa "precio a confirmar" (ej. marco renacentista) —
    // no hay total confiable para mostrar, a diferencia de 0 que sí es un precio real.
    if (frame.priceAdd === null) return null;
    return size.price + frame.priceAdd + getMerchTotal();
  }

  function formatARS(n) {
    if (n === null || n === undefined) return "$ 0 ARS";
    return "$ " + n.toLocaleString("es-AR") + " ARS";
  }

  function getMerchLabel() {
    const free = getFreeMerchIds(selection.size);
    const freeLabels = free.map((id) => findMerchItem(id)).filter(Boolean).map((m) => `${m.label} (incluida)`);
    const paidLabels = selection.merchAddons
      .filter((id) => !free.includes(id))
      .map((id) => findMerchItem(id))
      .filter(Boolean)
      .map((m) => m.label);
    const parts = [...freeLabels, ...paidLabels];
    return parts.length ? parts.join(" + ") : "Retrato solo";
  }

  function getLabels() {
    const size = findSize(selection.size);
    const frame = findFrame(selection.frame);
    const frameColor = findFrameColor(selection.frameColor);
    return {
      sizeLabel: size ? `${size.label} (${size.dims})` : "—",
      frameLabel: frame ? frame.label : "—",
      frameColorLabel: frameColor ? (frameColor.id === "otro" && selection.customFrameColorLabel ? selection.customFrameColorLabel : frameColor.label) : "—",
      merchLabel: getMerchLabel()
    };
  }

  function isReadyForMockup() {
    return Boolean(selection.size && selection.frame && selection.frameColor);
  }

  // ---------- rendering: options ----------

  function renderSizeOptions() {
    const wrap = document.querySelector("#step-size .size-options");
    if (!wrap) return;
    wrap.innerHTML = CFG.sizes
      .map(
        (s) => `
      <button type="button" class="size-card" data-size="${s.id}" aria-pressed="false">
        <span class="size-card-dims">${s.dims}</span>
        <span class="size-card-label">${s.label}</span>
        <span class="size-card-price">${formatARS(s.price)}</span>
      </button>`
      )
      .join("");
    wrap.querySelectorAll(".size-card").forEach((btn) => {
      btn.addEventListener("click", () => setSize(btn.dataset.size));
    });
  }

  function renderFrameOptions() {
    const wrap = document.querySelector("#step-frame .frame-options");
    if (!wrap) return;
    wrap.innerHTML = CFG.frames
      .map((f) => {
        const available = isFrameAvailable(f.id, selection.size);
        return `
      <button type="button" class="frame-card${available ? "" : " is-disabled"}" data-frame="${f.id}"
        aria-pressed="false" ${available ? "" : "disabled"}>
        <span class="frame-card-label">${f.label}</span>
        ${f.note ? `<span class="frame-card-note">${f.note}</span>` : ""}
      </button>`;
      })
      .join("");
    wrap.querySelectorAll(".frame-card:not(.is-disabled)").forEach((btn) => {
      btn.addEventListener("click", () => setFrame(btn.dataset.frame));
    });
  }

  function renderFrameColorOptions() {
    const wrap = document.querySelector("#step-frame-color .frame-color-options");
    if (!wrap) return;
    wrap.innerHTML = CFG.frameColors
      .map(
        (c) => `
      <button type="button" class="color-swatch${c.custom ? " color-swatch--custom" : ""}" data-frame-color="${c.id}"
        aria-pressed="false" aria-label="${c.label}" style="${c.hex ? `--swatch-color:${c.hex}` : ""}">
        ${c.custom ? "?" : ""}
      </button>`
      )
      .join("") + '<span class="frame-color-option-label" id="frame-color-option-label">Elegí un color</span>';
    wrap.querySelectorAll(".color-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.frameColor === "otro") {
          const custom = window.prompt("Describí el color de marco que te gustaría:", selection.customFrameColorLabel || "");
          if (custom === null) return;
          setFrameColor("otro", custom.trim());
        } else {
          setFrameColor(btn.dataset.frameColor);
        }
      });
    });
  }

  function formatARSShort(n) {
    return "$" + n.toLocaleString("es-AR");
  }

  function renderMerchIntro() {
    const introEl = document.getElementById("merch-intro");
    if (!introEl) return;
    const size = findSize(selection.size);
    const free = getFreeMerchIds(selection.size);
    if (!size) {
      introEl.textContent = "Elegí un tamaño para ver qué extras vienen incluidos gratis.";
      introEl.hidden = false;
      return;
    }
    if (!free.length) {
      introEl.textContent = `${size.label} no incluye extras gratis — sumá lo que quieras más abajo.`;
      introEl.hidden = false;
      return;
    }
    const freeLabels = free.map((id) => findMerchItem(id)?.label).filter(Boolean).join(" + ");
    introEl.innerHTML = `🎁 <strong>${size.label}</strong> incluye gratis: ${freeLabels}`;
    introEl.hidden = false;
  }

  function renderMerchOptions() {
    const wrap = document.querySelector("#step-merch .merch-options");
    if (!wrap) return;
    renderMerchIntro();
    const free = getFreeMerchIds(selection.size);
    wrap.innerHTML = CFG.merchItems
      .map((m) => {
        const isFree = free.includes(m.id);
        const isAdded = selection.merchAddons.includes(m.id);
        return `
      <div class="merch-item${isFree ? " is-free" : ""}${isAdded ? " is-added" : ""}" data-merch-item="${m.id}">
        <div class="merch-item-info">
          <span class="merch-item-label">${m.label}</span>
          <span class="merch-item-desc">${m.desc}</span>
        </div>
        <div class="merch-item-action">
          ${
            isFree
              ? `<span class="merch-badge-free">🎁 Incluido gratis</span>`
              : `<span class="merch-item-price">+${formatARSShort(m.price)}</span>
                 <button type="button" class="btn-merch-add" data-merch-add="${m.id}" aria-pressed="${isAdded}">${isAdded ? "Agregado ✓" : "Agregar"}</button>`
          }
        </div>
      </div>`;
      })
      .join("");
    wrap.querySelectorAll(".btn-merch-add").forEach((btn) => {
      btn.addEventListener("click", () => toggleMerchAddon(btn.dataset.merchAdd));
    });
  }

  function syncActiveStates() {
    document.querySelectorAll(".size-card").forEach((btn) => {
      const active = btn.dataset.size === selection.size;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".frame-card").forEach((btn) => {
      const active = btn.dataset.frame === selection.frame;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".color-swatch").forEach((btn) => {
      const active = btn.dataset.frameColor === selection.frameColor;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".btn-merch-add").forEach((btn) => {
      const added = selection.merchAddons.includes(btn.dataset.merchAdd);
      btn.classList.toggle("is-active", added);
      btn.setAttribute("aria-pressed", String(added));
      btn.textContent = added ? "Agregado ✓" : "Agregar";
      const item = document.querySelector(`.merch-item[data-merch-item="${btn.dataset.merchAdd}"]`);
      if (item) item.classList.toggle("is-added", added);
    });
  }

  function renderSummary() {
    const labels = getLabels();
    const totalEl = document.getElementById("summary-total");
    const sizeEl = document.getElementById("summary-size");
    const frameEl = document.getElementById("summary-frame");
    const frameColorEl = document.getElementById("summary-frame-color");
    const merchEl = document.getElementById("summary-merch");
    const nextBtn = document.getElementById("btn-to-mockup");

    if (sizeEl) sizeEl.textContent = labels.sizeLabel;
    if (frameEl) frameEl.textContent = labels.frameLabel;
    if (frameColorEl) frameColorEl.textContent = labels.frameColorLabel;
    if (merchEl) merchEl.textContent = labels.merchLabel;

    const price = getPrice();
    if (totalEl) {
      totalEl.textContent = price === null ? "A confirmar" : formatARS(price);
    }
    if (nextBtn) nextBtn.disabled = !isReadyForMockup();
  }

  // ---------- WhatsApp message ----------

  function buildWhatsAppMessage(clientData) {
    clientData = clientData || {};
    const labels = getLabels();
    const price = getPrice();
    const lines = [
      `¡Hola! Quiero encargar un retrato en *La Factoría*.`,
      ``,
      `*Tamaño:* ${labels.sizeLabel}`,
      `*Tipo de marco:* ${labels.frameLabel}`,
      `*Color de marco:* ${labels.frameColorLabel}`,
      `*Extra:* ${labels.merchLabel}`,
      `*Total estimado:* ${price === null ? "a confirmar" : formatARS(price)}`,
      ``
    ];
    if (clientData.petName) lines.push(`*Mascota:* ${clientData.petName}`);
    if (clientData.name) lines.push(`*Nombre:* ${clientData.name}`);
    if (clientData.email) lines.push(`*Email:* ${clientData.email}`);
    if (clientData.phone) lines.push(`*Teléfono:* ${clientData.phone}`);
    if (clientData.notes) lines.push(`*Notas:* ${clientData.notes}`);
    lines.push(``, `Voy a enviar la foto de mi mascota por acá mismo. ¡Gracias!`);
    return lines.join("\n");
  }

  function buildWhatsAppUrl(clientData) {
    const text = buildWhatsAppMessage(clientData);
    return `https://wa.me/${CFG.brand.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  // ---------- init ----------

  function init() {
    renderSizeOptions();
    renderFrameOptions();
    renderFrameColorOptions();
    renderMerchOptions();
    syncActiveStates();
    renderSummary();
  }

  window.FactoriaState = {
    selection,
    setSize,
    setFrame,
    setFrameColor,
    toggleMerchAddon,
    getPrice,
    getLabels,
    isFrameAvailable,
    isReadyForMockup,
    buildWhatsAppMessage,
    buildWhatsAppUrl,
    init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
