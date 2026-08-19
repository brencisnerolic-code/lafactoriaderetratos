/**
 * FACTORIA_CONFIG — single source of truth for pricing, brand data and
 * configurator options. state.js, mockup.js and main.js all read from here.
 *
 * Anything marked "TBD" is a placeholder Juana still needs to confirm —
 * see README.md > "Contenido pendiente" before launch.
 */
window.FACTORIA_CONFIG = {
  brand: {
    name: "La Factoría de Retratos",
    tagline: "by Juana Perfecta",
    fullName: "La Factoría de Retratos",
    artist: "Brenda Cisnero — Licenciada en Artes",
    instagramHandle: "@lafactoriaderetratos",
    instagramUrl: "https://www.instagram.com/lafactoriaderetratos",
    tiktokHandle: "@lafactoriaderetratos",
    tiktokUrl: "https://www.tiktok.com/@lafactoriaderetratos",
    whatsappNumber: "5491130509450", // 011 3050-9450, formato wa.me (54 9 11 3050 9450)
    whatsappDisplay: "011 3050-9450",
    email: "lafactoriabyjuanaperfecta@gmail.com",
    location: "CABA, Argentina",
    storeUrl: "https://juanaperfecta.mitiendanube.com/pets-art/"
  },

  // Los 3 tamaños destacados en el configurador (spec: máx 3 tarjetas visibles).
  // Precios actualizados (agosto 2024).
  //
  // wallImage/wallCanvas alimentan el mockup de pared (paso "Mirá tu retrato
  // en la pared"): wallImage es la foto de ambiente real para ese tamaño, y
  // wallCanvas es el rectángulo (en %, medido sobre esa foto) donde va la
  // foto que sube el cliente — el marco ya viene fotografiado en la imagen,
  // así que la superposición solo necesita esas 4 coordenadas.
  //
  // OJO: wallImage/wallCanvas de "chico" y "grande" están cruzados a
  // propósito respecto de sus nombres de archivo — en las fotos originales,
  // el marco fotografiado en "50x70.png" se ve más chico en cámara que el de
  // "25x35.png" (fueron tomadas a distancias distintas), así que para que la
  // escala se perciba correctamente en pantalla (grande = caja más grande)
  // "chico" usa la foto "50x70.png" y "grande" usa la foto "25x35.png".
  sizes: [
    {
      id: "chico", label: "Chico", dims: "25x35cm", price: 280000,
      wallImage: "50x70.png",
      wallCanvas: { left: 45.17, top: 25.14, width: 9.39, height: 17.86 }
    },
    {
      id: "mediano", label: "Mediano", dims: "35x45cm", price: 390000,
      wallImage: "35x45.png",
      wallCanvas: { left: 43.85, top: 23.11, width: 11.95, height: 22.74 }
    },
    {
      id: "grande", label: "Grande", dims: "50x70cm", price: 490000,
      wallImage: "25x35.png",
      wallCanvas: { left: 42.20, top: 21.09, width: 15.26, height: 29.01 }
    }
  ],

  // Tamaños reales adicionales, no destacados como tarjeta pero disponibles a pedido.
  sizesExtra: [
    { id: "mini", label: "Mini", dims: "10x15cm", price: 100000 },
    { id: "xl", label: "XL", dims: "70x100cm", price: 500000 }
  ],

  // Marco: solo 2 opciones (PLANO y BOX). BOX tiene costo adicional. El
  // cliente elige clickeando directamente sobre el marco que le gusta en la
  // imagen combinada "tipo de marco.png" (mismo mecanismo que frameColors).
  frameImage: "tipo de marco.png",
  frameMaterial: "Cuadro realizado en madera Kiri, con vidrio, tapa trasera de desmonte y soporte para colgar.",
  frames: [
    {
      id: "plano", label: "Marco PLANO", desc: "Acabado tradicional, línea limpia",
      specs: "2 cm frente × 1 cm profundidad",
      priceAdd: 0, availableFor: "all",
      hotspot: { left: 54, top: 8, width: 29, height: 84 }
    },
    {
      id: "box", label: "Marco BOX", desc: "Efecto 3D, profundidad, más impactante",
      specs: "1,5 cm frente × 2 cm profundidad",
      priceAdd: 10000, availableFor: "all",
      hotspot: { left: 15, top: 8, width: 30, height: 84 }
    }
  ],

  // Colores de marco: 4 opciones de la línea Kiri. El cliente elige clickeando
  // directamente sobre el marco que le gusta en la imagen combinada
  // "Color de marco.png" — cada hotspot es la región (en %) de esa imagen
  // donde vive ese marco.
  frameColorImage: "Color de marco.png",
  frameColors: [
    { id: "natural", label: "Marco Kiri Natural", priceAdd: 0, hex: "#D3B496", hotspot: { left: 1, top: 20, width: 24, height: 57 } },
    { id: "barnizado", label: "Marco Kiri Barnizado", priceAdd: 0, hex: "#E8A578", hotspot: { left: 25.5, top: 20, width: 24, height: 57 } },
    { id: "negro", label: "Marco Kiri Negro", priceAdd: 0, hex: "#201F1F", hotspot: { left: 50, top: 20, width: 24.5, height: 57 } },
    { id: "blanco", label: "Marco Kiri Blanco", priceAdd: 0, hex: "#F5F4F5", hotspot: { left: 74.5, top: 20, width: 25, height: 57 } }
  ],

  // Merchandising opcional. Cada tamaño de retrato incluye algunos ítems
  // gratis automáticamente (ver merchFreeBySize) — el resto se puede sumar
  // por su precio de lista.
  merchItems: [
    { id: "digital", label: "Pintura Digitalizada (HIGH RES)", desc: "Descarga digital en alta resolución de tu retrato", price: 10000 },
    { id: "remera", label: "Remera personalizada", desc: "Estampado de tu retrato en una remera", price: 40000 },
    { id: "totebag", label: "Totebag personalizado", desc: "Estampado de tu retrato en un totebag", price: 20000 }
  ],

  // Qué ítems de merchItems vienen incluidos gratis según el tamaño elegido.
  merchFreeBySize: {
    chico: [],
    mediano: ["digital"],
    grande: ["digital", "totebag"]
  },

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
