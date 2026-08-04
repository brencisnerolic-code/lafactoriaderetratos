/**
 * FACTORIA_CONFIG — single source of truth for pricing, brand data and
 * configurator options. state.js, mockup.js and main.js all read from here.
 *
 * Anything marked "TBD" is a placeholder Juana still needs to confirm —
 * see README.md > "Contenido pendiente" before launch.
 */
window.FACTORIA_CONFIG = {
  brand: {
    name: "La Factoría",
    tagline: "by Juana Perfecta",
    fullName: "La Factoría by Juana Perfecta",
    artist: "Brenda Cisnero — Licenciada en Artes",
    instagramHandle: "@lafactoriaderetratos",
    instagramUrl: "https://www.instagram.com/lafactoriaderetratos",
    whatsappNumber: "5491130509450", // 011 3050-9450, formato wa.me (54 9 11 3050 9450)
    whatsappDisplay: "011 3050-9450",
    email: "contacto@lafactoriaderetratos.com", // TBD: confirmar con Juana
    location: "CABA, Argentina",
    storeUrl: "https://juanaperfecta.mitiendanube.com/pets-art/"
  },

  // Los 3 tamaños destacados en el configurador (spec: máx 3 tarjetas visibles).
  // Precios reales tomados del presupuesto oficial (PDF, 07/2026).
  sizes: [
    { id: "chico", label: "Chico", dims: "25x35cm", price: 250000 },
    { id: "mediano", label: "Mediano", dims: "35x50cm", price: 300000 },
    { id: "grande", label: "Grande", dims: "50x70cm", price: 450000 }
  ],

  // Tamaños reales adicionales, no destacados como tarjeta pero disponibles a pedido.
  sizesExtra: [
    { id: "mini", label: "Mini", dims: "10x15cm", price: 100000 },
    { id: "xl", label: "XL", dims: "70x100cm", price: 500000 }
  ],

  // Marco: solo 2 opciones ahora (PLANO y BOX, renacentista eliminado).
  frames: [
    { id: "plano", label: "Marco PLANO", desc: "Elegante y minimalista", priceAdd: 0, availableFor: "all" },
    { id: "box", label: "Marco BOX", desc: "Con volumen y presencia", priceAdd: 0, availableFor: "all" }
  ],

  // Colores de marco: 9 opciones (8 preestablecidas + 1 personalizado).
  frameColors: [
    { id: "blanco", label: "Blanco", hex: "#F7F4EE" },
    { id: "negro", label: "Negro", hex: "#1B1815" },
    { id: "gris-claro", label: "Gris claro", hex: "#C9C4BB" },
    { id: "gris-oscuro", label: "Gris oscuro", hex: "#4A473F" },
    { id: "madera-clara", label: "Madera clara", hex: "#D4A574" },
    { id: "madera-oscura", label: "Madera oscura", hex: "#6B4423" },
    { id: "oro", label: "Oro", hex: "#D4AF37" },
    { id: "plata", label: "Plata", hex: "#C0C0C0" },
    { id: "otro", label: "Otro color", hex: null, custom: true }
  ],

  // TBD: merchandising aún no tiene precio confirmado — se muestra "Próximamente".
  merch: [
    { id: "solo", label: "Retrato solo", priceAdd: 0, available: true },
    { id: "remera", label: "Retrato + Remera impresa", priceAdd: null, available: false },
    { id: "totebag", label: "Retrato + Totebag impreso", priceAdd: null, available: false }
  ],

  depositPercent: 50,
  deliveryDays: 15,
  maxUploadMB: 10,
  acceptedUploadTypes: ["image/jpeg", "image/png"],

  // TBD: datos reales de transferencia a confirmar con Juana (ver README.md).
  // Nunca inventar estos valores — un dato mal puesto manda la plata del
  // cliente a una cuenta incorrecta.
  bankTransfer: {
    banco: "TBD — completar con Juana",
    titular: "TBD — completar con Juana",
    cbu: "TBD — completar con Juana",
    alias: "TBD — completar con Juana"
  },

  // El Access Token de Mercado Pago NUNCA va acá (es secreto). Vive como
  // variable de entorno MP_ACCESS_TOKEN en Netlify, y solo lo usa
  // netlify/functions/create-preference.js del lado del servidor.
  payment: {
    createPreferenceEndpoint: "/.netlify/functions/create-preference"
  }
};
