/**
 * i18n.js — lightweight ES/EN language switcher for the whole site.
 *
 * How it works:
 *   - Static HTML text is translated via data-i18n / data-i18n-html /
 *     data-i18n-placeholder / data-i18n-aria-label attributes (see index.html).
 *   - Config-driven labels (size/frame/frame color/merch names, coming from
 *     FACTORIA_CONFIG and rendered by state.js) are translated via
 *     I18N.label()/I18N.desc() by id, looked up in CONFIG_LABELS below.
 *   - Other scripts (state.js, mockup.js, payment.js, main.js) call I18N.t(key)
 *     for the sentences they build dynamically, and listen for the
 *     "factoria:lang-change" window event to re-render when the user switches.
 *
 * Scope decision: the WhatsApp messages sent TO Juana (order summary, transfer
 * receipt handoff) are always built in Spanish regardless of site language,
 * since she reads them — only the on-page UI is bilingual.
 */
window.I18N = (function () {
  "use strict";

  var STRINGS = {
    es: {
      nav_open_menu: "Abrir menú",
      nav_create: "Crear mi retrato",
      nav_portfolio: "Portfolio",
      nav_testimonials: "Testimonios",
      nav_faq: "Preguntas frecuentes",
      nav_cta: "Comenzar mi retrato",
      logo_aria: "La Factoría de Retratos — inicio",

      hero_eyebrow: "Retratos de mascotas, pintados a mano",
      hero_title_html: "Retrato de tu mascota,<br>personalizado y único",
      hero_sub: "Un auto-regalo emotivo que celebra tu vínculo. Pintado a mano en acrílico u óleo sobre madera — no es una impresión, es una obra original.",
      hero_cta_primary: "Comenzar mi retrato",
      hero_cta_secondary: "Ver galería",

      config_heading: "Armá tu retrato",
      config_subheading: "Elegí tamaño, marco y fondo. El precio se actualiza al instante.",
      step1_legend: "1. Tamaño",
      step1_group_aria: "Elegir tamaño del retrato",
      step1_note_html: "¿Necesitás otra medida? Contamos con opciones personalizadas. <a href=\"#contacto-whatsapp\" class=\"link-whatsapp-generic\">Escribinos por WhatsApp</a>.",
      step2_legend: "2. Marco — Elegí tu estilo",
      step2_intro: "tu retrato viene enmarcado y listo para colgar",
      step2_material_note: "Cuadro realizado en madera Kiri, con vidrio, tapa trasera de desmonte y soporte para colgar. Tocá el marco que más te guste en la imagen.",
      step2_group_aria: "Elegir tipo de marco",
      frame_specs_plano_html: "<strong>Marco Plano:</strong> 2 cm frente × 1 cm profundidad",
      frame_specs_box_html: "<strong>Marco Box:</strong> 1,5 cm frente × 2 cm profundidad",
      step3_legend: "3. Color de marco",
      step3_intro: "Tocá el marco que más te guste en la imagen.",
      step3_group_aria: "Elegir color de marco",
      step4_legend: "4. Fondo del retrato",
      step4_intro: "¿Qué fondo preferís?",
      step4_group_aria: "Preferencia de fondo",
      bgpref_artist_label: "Dejar que la artista decida el fondo ideal",
      bgpref_artist_note: "Recomendado — la artista elegirá según tu mascota",
      bgpref_custom_label: "Quiero un fondo de color específico",
      bgpref_custom_field_label_html: "Describí el color o estilo que querés <span class=\"step-optional\">(opcional)</span>",
      bgpref_custom_placeholder: "Ej: fondo celeste pastel, tonos tierra, degradé...",
      step5_legend_html: "5. Sumá merchandising <span class=\"step-optional\">(opcional)</span>",
      step5_note: "La impresión es de tu retrato ya terminado (la pintura).",
      merch_group_aria: "Elegir merchandising adicional",

      summary_heading: "Tu retrato",
      summary_size_label: "Tamaño",
      summary_frame_label: "Tipo de marco",
      summary_frame_color_label: "Color de marco",
      summary_bg_label: "Fondo",
      summary_extra_label: "Extra",
      summary_total_label: "Total estimado",
      summary_fine_print: "Seña del 50% para comenzar · entrega estimada 15 días.",
      btn_to_mockup: "Ver en mi pared",

      mockup_eyebrow: "La joya de la corona",
      mockup_heading: "Mirá tu retrato en la pared",
      mockup_sub: "Subí una foto de tu mascota y mirá exactamente cómo va a quedar, colgado y enmarcado, antes de comprar.",
      dropzone_html: "<strong>Arrastrá una foto</strong> o hacé clic para elegir",
      dropzone_hint: "JPG o PNG, máx. 10MB",
      dropzone_tip: "✓ Cualquier foto funciona, mejor definición = mejor resultado",
      btn_back_to_config: "← Cambiar configuración",
      btn_to_checkout: "Siguiente paso",

      checkout_heading: "Últimos datos",
      checkout_sub_html: "Enviás la foto de tu mascota. Nosotros creamos una <strong>pintura original</strong>. El retrato final será único y tendrá nuestro estilo artístico.",
      label_pet_name_html: "Nombre de tu mascota <span class=\"optional\">(opcional)</span>",
      label_your_name_html: "Tu nombre <span class=\"required\">*</span>",
      label_email_html: "Email <span class=\"required\">*</span>",
      label_phone_html: "Teléfono / WhatsApp <span class=\"required\">*</span>",
      label_notes_html: "Notas especiales <span class=\"optional\">(opcional, máx. 500 caracteres)</span>",
      notes_placeholder: "Ej: \"Quiero capturar su expresión traviesa\" o \"Tiene un lunar especial\"",
      terms_checkbox_html: "Acepto los <a href=\"terminos.html\" target=\"_blank\" rel=\"noopener\" class=\"link-terms\">términos y condiciones</a>",
      payment_note: "Con la seña del 50% arrancamos tu retrato. Elegís cómo pagar en el siguiente paso.",
      btn_continue_payment: "Continuar al pago",

      payment_heading: "Elegí tu método de pago",
      payment_sub: "Ambos métodos son seguros y rápidos.",
      payment_total_label: "Seña a pagar hoy (50%):",
      mp_title: "Mercado Pago",
      mp_desc: "Pagá con tarjeta online, al instante.",
      transfer_title: "Transferencia bancaria",
      transfer_desc: "Te mostramos los datos para transferir.",

      modal_close_aria: "Cerrar",
      transfer_banco_label: "Banco",
      transfer_titular_label: "Titular",
      transfer_cbu_label: "CBU",
      transfer_alias_label: "Alias",
      transfer_amount_label: "Monto a transferir",
      transfer_concept_label: "Concepto",
      transfer_concept_value_html: "Retrato mascota — Orden #<span id=\"transfer-order-number\">—</span>",
      btn_copy: "Copiar",
      transfer_warning: "Una vez que hagas la transferencia, mandanos el comprobante por WhatsApp para arrancar tu retrato.",
      btn_confirm_transfer: "Confirmar transferencia por WhatsApp",

      portfolio_heading: "Nuestros trabajos",
      portfolio_sub: "Cada retrato es único, hecho a mano.",
      gallery_caption: "Acrílico sobre madera",
      portfolio_more_link: "Ver más en Instagram @lafactoriaderetratos →",

      testimonials_heading: "Lo que dicen nuestros clientes",

      about_heading: "Detrás de cada retrato",
      about_p1: "La Factoría es un estudio de retratos de autor creado por Juana Perfecta, artista visual argentina con una práctica desarrollada entre la pintura, el hiperrealismo y la exploración de la materia.",
      about_p2: "Cada retrato es pintado personalmente por ella, de principio a fin, a partir de las fotografías y la historia de cada mascota. No buscamos simplemente reproducir una imagen, sino capturar esa mirada, ese gesto o esa expresión que hace que tu compañero sea único.",
      about_p3: "El resultado es una obra original, hecha a mano y creada especialmente para vos, pensada para conservar su esencia y acompañarte en el tiempo.",
      about_p4: "Antes de darla por terminada, la revisamos con vos. Los ajustes que sean necesarios están incluidos, sin costo adicional.",
      about_credit: "Juana Perfecta es el nombre artístico de Brenda Cisnero, Licenciada en Artes Visuales, con formación y trayectoria artística en Argentina y Estados Unidos.",

      faq_heading: "Preguntas frecuentes",
      faq_q1: "¿Qué fotos necesito enviar?",
      faq_a1: "Cualquier foto clara de tu mascota. Mientras mejor definición tenga, mejor será el resultado.",
      faq_q2: "¿Qué pasa si mi foto no tiene buena calidad?",
      faq_a2: "Si tienes dudas, envíanosla mejor posible y un mensaje por WhatsApp. Evaluaremos juntos si podemos trabajar con ella.",
      faq_q3: "¿Cuánto tarda mi retrato?",
      faq_a3: "Entre 5 y 15 días hábiles, dependiendo de nuestra agenda.",
      faq_q4: "¿Qué tamaño recomiendan?",
      faq_a4: "Depende de dónde lo cuelgues. Chico (25x35) para espacios íntimos. Mediano/Grande para living o salón. Consultanos si dudas.",
      faq_q5: "¿Puedo incluir más de una mascota o personas?",
      faq_a5: "Sí. Podemos realizar retratos con varias mascotas. Para personas, depende de la foto. ¡Envíanosla y evaluamos!",
      faq_q6: "¿Qué técnica utilizan?",
      faq_a6: "Cada retrato está pintado completamente a mano sobre lienzo con pintura acrílica u óleo. No imprimimos fotografías ni utilizamos procesos industriales. Cada obra es única y original.",
      faq_q7: "¿Puedo pedir cambios antes del envío?",
      faq_a7: "Sí. Antes de enviarte el retrato final, te mostramos una foto. Puedes solicitar ajustes sin cargo adicional.",
      faq_q8: "¿Qué incluye mi compra?",
      faq_a8: "Tu retrato original pintado a mano sobre lienzo, su marco, sistema listo para colgar y embalaje especial para que llegue en perfectas condiciones.",
      faq_q9: "¿Puedo encargar un retrato como regalo?",
      faq_a9: "¡Por supuesto! Es uno de los regalos más elegidos por quienes consideran a sus mascotas parte de la familia. Te recomendamos hacer el pedido con anticipación si es para una fecha especial.",
      faq_q10: "¿Realizan envíos a todo el país y al exterior?",
      faq_a10: "Sí. Realizamos envíos a toda Argentina y también a otros países. Cada obra se embala cuidadosamente para garantizar que llegue en excelentes condiciones.",

      shipping_heading_html: "📦 Envío y retiro",
      shipping_card1_title: "Envío gratis a todo el país",
      shipping_card1_text: "Llega en 5-7 días hábiles después de haberlo terminado. Embalado profesionalmente para que llegue perfecto.",
      shipping_card2_title: "Retiro en el atelier",
      shipping_card2_text_html: "<strong>Sinclair 3026, PB</strong> — Ciudad Autónoma de Buenos Aires. Coordinamos horario por WhatsApp.",

      footer_nav_home: "Home",
      footer_nav_shop: "Shop",
      footer_nav_portfolio: "Portfolio",
      footer_nav_faq: "FAQ",
      footer_nav_terms: "Términos",
      footer_nav_privacy: "Privacidad",
      footer_copy_prefix: "©",
      footer_copy_suffix: "La Factoría de Retratos. Todos los derechos reservados.",
      whatsapp_aria: "Escribinos por WhatsApp",

      meta_title: "La Factoría de Retratos — Retratos de mascotas pintados a mano",
      meta_description: "Retrato de tu mascota, pintado a mano en acrílico u óleo sobre madera. Un auto-regalo emotivo, único e irrepetible. Configurá el tuyo y mirá cómo queda en tu pared antes de comprar.",

      // ---- dynamic strings used by state.js / mockup.js / payment.js / main.js ----
      state_choose_frame_prompt: "Elegí un marco tocando la imagen",
      state_you_chose: "Elegiste:",
      state_no_extra_cost: " — sin costo extra",
      state_choose_frame_color_prompt: "Elegí un color de marco tocando la imagen",
      state_portrait_only: "Retrato solo",
      state_included_suffix: " (incluida)",
      state_artist_decides_bg: "La artista decide el fondo ideal",
      state_specific_bg_prefix: "Fondo específico: ",
      state_specific_bg_empty: "Fondo específico (sin detalle aún)",
      state_choose_size_for_extras: "Elegí un tamaño para ver qué extras vienen incluidos gratis.",
      state_size_no_free_extras: "{size} no incluye extras gratis — sumá lo que quieras más abajo.",
      state_includes_free: "incluye gratis:",
      state_included_free_badge: "🎁 Incluido gratis",
      state_add_btn: "Agregar",
      state_added_btn: "Agregado ✓",
      state_to_be_confirmed: "A confirmar",
      frame_picker_alt: "Los 2 tipos de marco disponibles: Marco Box y Marco Plano",
      frame_color_picker_alt: "Los 4 colores de marco disponibles: Kiri Natural, Kiri Barnizado, Kiri Negro y Kiri Blanco",
      frame_choose_aria_prefix: "Elegir ",

      mockup_error_filetype: "Solo se aceptan archivos JPG o PNG.",
      mockup_error_filesize: "El archivo supera los {mb}MB. Probá con una foto más liviana.",
      mockup_preview_alt: "Vista previa de tu mascota en el retrato",
      mockup_size_hint: "Así se ve a escala real el tamaño {label} ({dims})",

      payment_amount_tbd: "A confirmar por WhatsApp",
      payment_copied: "¡Copiado!",
      payment_connecting_mp: "Conectando con Mercado Pago…",
      payment_error_no_amount: "No pudimos calcular el monto a pagar. Volvé al configurador y revisá tu selección.",
      payment_error_file_protocol: "Mercado Pago solo funciona en el sitio publicado (netlify.app), no abriendo el archivo local. Probá con transferencia bancaria acá, o subí los cambios y probá la compra en el sitio en vivo.",
      payment_error_unknown_mp: "Error desconocido de Mercado Pago.",
      payment_error_no_link: "Mercado Pago no devolvió un link de pago.",
      payment_error_mp_generic_prefix: "No pudimos conectar con Mercado Pago (",
      payment_error_mp_generic_suffix: "). Probá con transferencia bancaria, o escribinos por WhatsApp.",

      form_error_incomplete_config: "Volvé al configurador y completá tamaño, marco y fondo antes de continuar.",
      form_error_required_fields: "Completá los campos obligatorios y aceptá los términos para continuar."
    },

    en: {
      nav_open_menu: "Open menu",
      nav_create: "Create my portrait",
      nav_portfolio: "Portfolio",
      nav_testimonials: "Testimonials",
      nav_faq: "FAQ",
      nav_cta: "Start my portrait",
      logo_aria: "La Factoría de Retratos — home",

      hero_eyebrow: "Hand-painted pet portraits",
      hero_title_html: "A portrait of your pet,<br>personalized and unique",
      hero_sub: "An emotional self-gift that celebrates your bond. Hand-painted in acrylic or oil on wood — not a print, an original work of art.",
      hero_cta_primary: "Start my portrait",
      hero_cta_secondary: "See gallery",

      config_heading: "Build your portrait",
      config_subheading: "Choose size, frame and background. The price updates instantly.",
      step1_legend: "1. Size",
      step1_group_aria: "Choose portrait size",
      step1_note_html: "Need a different size? We also offer custom options. <a href=\"#contacto-whatsapp\" class=\"link-whatsapp-generic\">Message us on WhatsApp</a>.",
      step2_legend: "2. Frame — Choose your style",
      step2_intro: "your portrait comes framed and ready to hang",
      step2_material_note: "Frame made of Kiri wood, with glass, a removable back cover and hanging hardware. Tap the frame you like best in the image.",
      step2_group_aria: "Choose frame type",
      frame_specs_plano_html: "<strong>Flat Frame:</strong> 2 cm front × 1 cm depth",
      frame_specs_box_html: "<strong>Box Frame:</strong> 1.5 cm front × 2 cm depth",
      step3_legend: "3. Frame color",
      step3_intro: "Tap the frame you like best in the image.",
      step3_group_aria: "Choose frame color",
      step4_legend: "4. Portrait background",
      step4_intro: "Which background do you prefer?",
      step4_group_aria: "Background preference",
      bgpref_artist_label: "Let the artist choose the ideal background",
      bgpref_artist_note: "Recommended — the artist will choose based on your pet",
      bgpref_custom_label: "I want a specific background color",
      bgpref_custom_field_label_html: "Describe the color or style you want <span class=\"step-optional\">(optional)</span>",
      bgpref_custom_placeholder: "E.g.: pastel blue background, earth tones, gradient...",
      step5_legend_html: "5. Add merchandise <span class=\"step-optional\">(optional)</span>",
      step5_note: "The print is of your finished portrait (the painting).",
      merch_group_aria: "Choose additional merchandise",

      summary_heading: "Your portrait",
      summary_size_label: "Size",
      summary_frame_label: "Frame type",
      summary_frame_color_label: "Frame color",
      summary_bg_label: "Background",
      summary_extra_label: "Extra",
      summary_total_label: "Estimated total",
      summary_fine_print: "50% deposit to start · estimated delivery 15 days.",
      btn_to_mockup: "See it on my wall",

      mockup_eyebrow: "The crown jewel",
      mockup_heading: "See your portrait on the wall",
      mockup_sub: "Upload a photo of your pet and see exactly how it will look, framed and hung, before you buy.",
      dropzone_html: "<strong>Drag a photo</strong> or click to choose one",
      dropzone_hint: "JPG or PNG, max. 10MB",
      dropzone_tip: "✓ Any photo works, higher definition = better result",
      btn_back_to_config: "← Change configuration",
      btn_to_checkout: "Next step",

      checkout_heading: "Last details",
      checkout_sub_html: "You send us a photo of your pet. We create an <strong>original painting</strong>. The final portrait will be unique and in our artistic style.",
      label_pet_name_html: "Your pet's name <span class=\"optional\">(optional)</span>",
      label_your_name_html: "Your name <span class=\"required\">*</span>",
      label_email_html: "Email <span class=\"required\">*</span>",
      label_phone_html: "Phone / WhatsApp <span class=\"required\">*</span>",
      label_notes_html: "Special notes <span class=\"optional\">(optional, max. 500 characters)</span>",
      notes_placeholder: "E.g.: \"I want to capture her mischievous look\" or \"He has a special birthmark\"",
      terms_checkbox_html: "I accept the <a href=\"terminos.html\" target=\"_blank\" rel=\"noopener\" class=\"link-terms\">terms and conditions</a>",
      payment_note: "With the 50% deposit we start your portrait. You'll choose how to pay in the next step.",
      btn_continue_payment: "Continue to payment",

      payment_heading: "Choose your payment method",
      payment_sub: "Both methods are safe and fast.",
      payment_total_label: "Deposit due today (50%):",
      mp_title: "Mercado Pago",
      mp_desc: "Pay with a card online, instantly.",
      transfer_title: "Bank transfer",
      transfer_desc: "We'll show you the details to transfer.",

      modal_close_aria: "Close",
      transfer_banco_label: "Bank",
      transfer_titular_label: "Account holder",
      transfer_cbu_label: "CBU",
      transfer_alias_label: "Alias",
      transfer_amount_label: "Amount to transfer",
      transfer_concept_label: "Reference",
      transfer_concept_value_html: "Pet portrait — Order #<span id=\"transfer-order-number\">—</span>",
      btn_copy: "Copy",
      transfer_warning: "Once you make the transfer, send us the receipt on WhatsApp to start your portrait.",
      btn_confirm_transfer: "Confirm transfer on WhatsApp",

      portfolio_heading: "Our work",
      portfolio_sub: "Every portrait is unique, made by hand.",
      gallery_caption: "Acrylic on wood",
      portfolio_more_link: "See more on Instagram @lafactoriaderetratos →",

      testimonials_heading: "What our clients say",

      about_heading: "Behind every portrait",
      about_p1: "La Factoría is an author-portrait studio created by Juana Perfecta, an Argentine visual artist with a practice spanning painting, hyperrealism, and material exploration.",
      about_p2: "Every portrait is personally painted by her, from start to finish, based on the photos and story of each pet. We don't just aim to reproduce an image — we aim to capture the look, gesture or expression that makes your companion one of a kind.",
      about_p3: "The result is an original, handmade work of art created especially for you, meant to preserve its essence and stay with you over time.",
      about_p4: "Before considering it finished, we review it with you. Any adjustments you need are included at no extra cost.",
      about_credit: "Juana Perfecta is the artistic name of Brenda Cisnero, a graduate in Visual Arts, trained and with an artistic career in Argentina and the United States.",

      faq_heading: "Frequently asked questions",
      faq_q1: "What photos do I need to send?",
      faq_a1: "Any clear photo of your pet. The higher the definition, the better the result.",
      faq_q2: "What if my photo isn't good quality?",
      faq_a2: "If you're unsure, send us the best version you have along with a message on WhatsApp. We'll evaluate together whether we can work with it.",
      faq_q3: "How long does my portrait take?",
      faq_a3: "Between 5 and 15 business days, depending on our schedule.",
      faq_q4: "What size do you recommend?",
      faq_a4: "It depends on where you'll hang it. Small (25x35) for intimate spaces. Medium/Large for a living room. Ask us if you're not sure.",
      faq_q5: "Can I include more than one pet or people?",
      faq_a5: "Yes. We can make portraits with several pets. For people, it depends on the photo — send it over and we'll evaluate!",
      faq_q6: "What technique do you use?",
      faq_a6: "Every portrait is fully hand-painted on canvas with acrylic or oil paint. We don't print photographs or use industrial processes. Each piece is unique and original.",
      faq_q7: "Can I request changes before shipping?",
      faq_a7: "Yes. Before sending you the final portrait, we show you a photo. You can request adjustments at no extra cost.",
      faq_q8: "What's included in my purchase?",
      faq_a8: "Your original hand-painted canvas portrait, its frame, ready-to-hang hardware, and special packaging so it arrives in perfect condition.",
      faq_q9: "Can I order a portrait as a gift?",
      faq_a9: "Of course! It's one of the most popular gifts among people who consider their pets part of the family. We recommend ordering ahead of time if it's for a special date.",
      faq_q10: "Do you ship nationwide and internationally?",
      faq_a10: "Yes. We ship throughout Argentina and to other countries as well. Each piece is carefully packaged to ensure it arrives in excellent condition.",

      shipping_heading_html: "📦 Shipping & pickup",
      shipping_card1_title: "Free shipping nationwide",
      shipping_card1_text: "Arrives in 5-7 business days after it's finished. Professionally packaged so it arrives in perfect condition.",
      shipping_card2_title: "Pickup at the studio",
      shipping_card2_text_html: "<strong>Sinclair 3026, PB</strong> — Buenos Aires City, Argentina. We coordinate the time on WhatsApp.",

      footer_nav_home: "Home",
      footer_nav_shop: "Shop",
      footer_nav_portfolio: "Portfolio",
      footer_nav_faq: "FAQ",
      footer_nav_terms: "Terms",
      footer_nav_privacy: "Privacy",
      footer_copy_prefix: "©",
      footer_copy_suffix: "La Factoría de Retratos. All rights reserved.",
      whatsapp_aria: "Message us on WhatsApp",

      meta_title: "La Factoría de Retratos — Hand-painted pet portraits",
      meta_description: "A portrait of your pet, hand-painted in acrylic or oil on wood. An emotional, one-of-a-kind self-gift. Configure yours and see how it looks on your wall before you buy.",

      state_choose_frame_prompt: "Tap the image to choose a frame",
      state_you_chose: "You chose:",
      state_no_extra_cost: " — no extra cost",
      state_choose_frame_color_prompt: "Tap the image to choose a frame color",
      state_portrait_only: "Portrait only",
      state_included_suffix: " (included)",
      state_artist_decides_bg: "The artist decides the ideal background",
      state_specific_bg_prefix: "Specific background: ",
      state_specific_bg_empty: "Specific background (no detail yet)",
      state_choose_size_for_extras: "Choose a size to see which extras are included for free.",
      state_size_no_free_extras: "{size} doesn't include free extras — add whatever you'd like below.",
      state_includes_free: "includes for free:",
      state_included_free_badge: "🎁 Included free",
      state_add_btn: "Add",
      state_added_btn: "Added ✓",
      state_to_be_confirmed: "To be confirmed",
      frame_picker_alt: "The 2 available frame types: Box Frame and Flat Frame",
      frame_color_picker_alt: "The 4 available frame colors: Natural Kiri, Varnished Kiri, Black Kiri and White Kiri",
      frame_choose_aria_prefix: "Choose ",

      mockup_error_filetype: "Only JPG or PNG files are accepted.",
      mockup_error_filesize: "The file is over {mb}MB. Try a lighter photo.",
      mockup_preview_alt: "Preview of your pet in the portrait",
      mockup_size_hint: "This is the real scale for the {label} size ({dims})",

      payment_amount_tbd: "To be confirmed on WhatsApp",
      payment_copied: "Copied!",
      payment_connecting_mp: "Connecting to Mercado Pago…",
      payment_error_no_amount: "We couldn't calculate the amount to pay. Go back to the configurator and check your selection.",
      payment_error_file_protocol: "Mercado Pago only works on the published site (netlify.app), not when opening the local file. Try bank transfer here, or push your changes and test the purchase on the live site.",
      payment_error_unknown_mp: "Unknown Mercado Pago error.",
      payment_error_no_link: "Mercado Pago didn't return a payment link.",
      payment_error_mp_generic_prefix: "We couldn't connect to Mercado Pago (",
      payment_error_mp_generic_suffix: "). Try bank transfer, or message us on WhatsApp.",

      form_error_incomplete_config: "Go back to the configurator and complete size, frame and background before continuing.",
      form_error_required_fields: "Fill in the required fields and accept the terms to continue."
    }
  };

  // Config-driven labels (ids come from js/config.js). Spanish falls back to
  // whatever is already in FACTORIA_CONFIG, so only English needs listing here.
  var CONFIG_LABELS_EN = {
    sizes: { chico: "Small", mediano: "Medium", grande: "Large" },
    sizesExtra: { mini: "Mini", xl: "XL" },
    frames: {
      plano: { label: "Flat Frame", desc: "Traditional finish, clean line" },
      box: { label: "Box Frame", desc: "3D effect, more depth, more striking" }
    },
    frameColors: {
      natural: "Natural Kiri Frame",
      barnizado: "Varnished Kiri Frame",
      negro: "Black Kiri Frame",
      blanco: "White Kiri Frame"
    },
    merchItems: {
      digital: { label: "Digitized Painting (HIGH RES)", desc: "High-resolution digital download of your portrait" },
      remera: { label: "Custom T-Shirt", desc: "Your portrait printed on a t-shirt" },
      totebag: { label: "Custom Tote Bag", desc: "Your portrait printed on a tote bag" }
    }
  };

  var lang = "es";
  try {
    lang = window.localStorage.getItem("factoria-lang") || "es";
  } catch (e) {
    lang = "es";
  }
  if (lang !== "en") lang = "es";

  function getLang() {
    return lang;
  }

  function t(key, vars) {
    var dict = STRINGS[lang] || STRINGS.es;
    var str = dict[key];
    if (str === undefined) str = (STRINGS.es[key] !== undefined) ? STRINGS.es[key] : key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(vars[k]);
      });
    }
    return str;
  }

  function label(category, id, fallback) {
    if (lang !== "en") return fallback;
    var cat = CONFIG_LABELS_EN[category];
    var entry = cat && cat[id];
    if (entry == null) return fallback;
    return typeof entry === "string" ? entry : (entry.label || fallback);
  }

  function desc(category, id, fallback) {
    if (lang !== "en") return fallback;
    var cat = CONFIG_LABELS_EN[category];
    var entry = cat && cat[id];
    return (entry && entry.desc) || fallback;
  }

  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-i18n-caption]").forEach(function (el) {
      el.setAttribute("data-caption", t(el.getAttribute("data-i18n-caption")));
    });
    document.title = t("meta_title");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta_description"));
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "es-AR");
  }

  function syncToggleUI() {
    document.querySelectorAll(".lang-option").forEach(function (el) {
      var isActive = el.getAttribute("data-lang-option") === lang;
      el.classList.toggle("is-active", isActive);
    });
    var toggle = document.getElementById("lang-toggle");
    if (toggle) toggle.setAttribute("aria-label", lang === "en" ? "Switch to Spanish" : "Cambiar a inglés");
  }

  function setLang(newLang) {
    lang = newLang === "en" ? "en" : "es";
    try {
      window.localStorage.setItem("factoria-lang", lang);
    } catch (e) {
      /* localStorage unavailable (e.g. file:// in some browsers) — language just won't persist */
    }
    applyStaticTranslations();
    syncToggleUI();
    window.dispatchEvent(new CustomEvent("factoria:lang-change", { detail: { lang: lang } }));
  }

  function initToggle() {
    var toggle = document.getElementById("lang-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      setLang(lang === "es" ? "en" : "es");
    });
  }

  function init() {
    applyStaticTranslations();
    syncToggleUI();
    initToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { t: t, label: label, desc: desc, getLang: getLang, setLang: setLang };
})();
