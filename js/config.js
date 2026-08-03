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
    { id: "chico", label: "Chico", dims: "25x30cm", price: 250000 },
    { id: "mediano", label: "Mediano", dims: "35x50cm", price: 300000 },
    { id: "grande", label: "Grande", dims: "50x70cm", price: 450000 }
  ],

  // Tamaños reales adicionales, no destacados como tarjeta pero disponibles a pedido.
  sizesExtra: [
    { id: "mini", label: "Mini", dims: "10x15cm", price: 100000 },
    { id: "xl", label: "XL", dims: "70x100cm", price: 500000 }
  ],

  // Marco: solo lo que realmente se ofrece hoy. "Renacentista" únicamente para 35x50cm.
  frames: [
    { id: "simple", label: "Marco simple de madera", priceAdd: 0, availableFor: "all" },
    {
      id: "renacentista",
      label: "Marco renacentista",
      priceAdd: null,
      availableFor: ["mediano"],
      note: "Disponible solo en 35x50cm · precio a confirmar por WhatsApp"
    }
  ],

  // TBD: colores de fondo a confirmar con Juana (spec sugiere estos 6).
  bgColors: [
    { id: "blanco", label: "Blanco limpio", hex: "#F7F4EE" },
    { id: "gris-claro", label: "Gris claro", hex: "#C9C4BB" },
    { id: "gris-oscuro", label: "Gris oscuro", hex: "#4A473F" },
    { id: "negro", label: "Negro", hex: "#1B1815" },
    { id: "celeste", label: "Azul claro", hex: "#A9C4D4" },
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
