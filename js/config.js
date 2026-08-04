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
  // Precios actualizados (agosto 2024).
  sizes: [
    { id: "chico", label: "Chico", dims: "25x35cm", price: 280000 },
    { id: "mediano", label: "Mediano", dims: "35x50cm", price: 390000 },
    { id: "grande", label: "Grande", dims: "50x70cm", price: 490000 }
  ],

  // Tamaños reales adicionales, no destacados como tarjeta pero disponibles a pedido.
  sizesExtra: [
    { id: "mini", label: "Mini", dims: "10x15cm", price: 100000 },
    { id: "xl", label: "XL", dims: "70x100cm", price: 500000 }
  ],

  // Marco: solo 2 opciones (PLANO y BOX). BOX tiene costo adicional.
  frames: [
    { id: "plano", label: "Marco PLANO", desc: "Acabado tradicional, línea limpia", priceAdd: 0, availableFor: "all" },
    { id: "box", label: "Marco BOX", desc: "Efecto 3D, profundidad, más impactante", priceAdd: 10000, availableFor: "all" }
  ],

  // Colores de marco: 4 opciones principales.
  frameColors: [
    { id: "negro", label: "Negro (bestseller)", hex: "#1B1815" },
    { id: "blanco", label: "Blanco (minimalista)", hex: "#F7F4EE" },
    { id: "natural", label: "Natural (cálido)", hex: "#D4A574" },
    { id: "barnizado", label: "Barnizado (clásico)", hex: "#8B7355" }
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

  // Datos de transferencia bancaria (Banco Galicia).
  bankTransfer: {
    banco: "Banco Galicia",
    titular: "Brenda Jeanette Cisnero",
    cbu: "0070184230004005355418",
    alias: "BREN.CISNERO"
  },

  // El Access Token de Mercado Pago NUNCA va acá (es secreto). Vive como
  // variable de entorno MP_ACCESS_TOKEN en Netlify, y solo lo usa
  // netlify/functions/create-preference.js del lado del servidor.
  payment: {
    createPreferenceEndpoint: "/.netlify/functions/create-preference"
  }
};
