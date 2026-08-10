# La Factoría by Juana Perfecta — sitio de venta

Sitio estático (HTML + CSS + JS vanilla) + **una** función serverless (Netlify
Function) para Mercado Pago. Sitio y Netlify propios de "La Factoría" —
completamente separados del proyecto/Netlify de Juana Perfecta.

Después de completar sus datos, el cliente elige método de pago:
- **Mercado Pago** → crea una preferencia real vía `netlify/functions/create-preference.js`
  y redirige al checkout hospedado por Mercado Pago (Checkout Pro).
- **Transferencia bancaria** → muestra CBU/alias con botones de copiar, y un botón
  para mandar el comprobante por WhatsApp.

## Cómo verlo

Abrí `index.html` en el navegador, o serví la carpeta con cualquier servidor
estático (por ejemplo `npx serve .`).

## Estructura

- `index.html` — todas las secciones (hero, guía de fotos, configurador, mockup
  en pared, checkout, portfolio, testimonios, sobre nosotros, FAQ, footer).
- `css/style.css` — sistema de diseño (paleta terracota/marfil, Fraunces + Inter).
- `js/config.js` — **única fuente de precios y datos de marca**. Editar acá, no
  en el HTML, para cambiar precios/opciones.
- `js/state.js` — lógica del configurador, precio en vivo, arma el mensaje de WhatsApp.
- `js/mockup.js` — feature de "ver tu retrato en la pared" (subida de foto, rotar, iluminación).
- `js/payment.js` — selección de método de pago (Mercado Pago / transferencia).
- `js/main.js` — acordeón FAQ, lightbox de galería, nav mobile, validación de formulario.
- `netlify/functions/create-preference.js` — crea la preferencia de Mercado Pago
  del lado del servidor (ahí vive el Access Token, nunca en el frontend).
- `netlify.toml` — config de build/functions de este sitio (propia, no la de Juana Perfecta).

## Datos reales ya cargados (de la cotización oficial, 07/2026)

- Precios por tamaño: 10x15 $100.000 · 25x30 $250.000 · 35x50 $300.000 ·
  50x70 $450.000 · 70x100 $500.000.
- Marco simple de madera: incluido, todos los tamaños.
- Marco renacentista: **solo disponible en 35x50cm** (así lo marca la cotización).
- Seña: 50% · Plazo de entrega: 15 días.
- WhatsApp: 011 3050-9450 · Instagram: @lafactoriaderetratos · CABA.

## Contenido pendiente (para Juana)

- [x] **Fotos de portfolio reales** → cargadas en `img/portfolio/` y enlazadas en `#gallery-grid`.
- [x] **Foto de portada del hero** → `img/hero-retrato.png`.
- [x] **Foto de Juana** para "Sobre nosotros" → `img/about-juana.jpeg`.
- [x] **Testimonios reales** → capturas de chat de Instagram, recortadas en
      `img/testimonios/crops/` y mostradas como imagen en `#testimonios`.
- [x] **Datos de transferencia bancaria** → cargados en `js/config.js` → `bankTransfer`.
- [x] **Merchandising (remera / totebag)** → activado con precio real en `js/config.js` → `merchItems`.
- [ ] **Email de contacto** — sigue siendo `contacto@lafactoriaderetratos.com` como
      placeholder en `js/config.js` → `brand.email`; confirmar si es real.
- [ ] **Términos y condiciones / Privacidad** — los links en el checkout y footer
      hoy no llevan a ningún lado (`href="#"`). Falta redactar el texto legal
      (o al menos una versión mínima) y linkearlo.
- [ ] **Access Token de Mercado Pago** — variable de entorno `MP_ACCESS_TOKEN`
      en Netlify (Site settings → Environment variables), nunca en el código.
      Se obtiene en https://www.mercadopago.com.ar/developers/panel → tus
      credenciales de producción. **Esto lo tiene que hacer Juana** (Claude no
      puede ingresar tokens/credenciales por política de seguridad).
- [ ] **Confirmar deploy en Netlify** — verificar que el sitio esté conectado al
      repo `github.com/brencisnerolic-code/lafactoriaderetratos` y probar el
      botón de Mercado Pago ya en producción (no funciona en `file://` local).

## Cómo desplegar (Netlify)

1. Crear un sitio **nuevo** en Netlify apuntando a este repo/carpeta (no el de
   Juana Perfecta — son dos sitios distintos).
2. En Site settings → Environment variables, agregar `MP_ACCESS_TOKEN` con el
   Access Token real de Mercado Pago.
3. Netlify detecta `netlify.toml` automáticamente (publish = raíz del sitio,
   functions = `netlify/functions`).
4. Probar el botón de Mercado Pago en el sitio ya desplegado — la función no
   corre en `file://` ni en un servidor estático local, solo en Netlify (o
   `netlify dev` localmente si tenés la Netlify CLI instalada).

## Notas de alcance

- No hay envío de emails automáticos post-compra en esta etapa (requeriría
  otra función server-side + un proveedor de email, ej. Resend o SendGrid).
- Se muestran 3 tamaños destacados (Chico/Mediano/Grande) como tarjetas, y los
  2 tamaños extremos (Mini 10x15 / XL 70x100) se ofrecen por texto + WhatsApp,
  para no saturar el configurador visual mientras se mantienen los 5 precios reales.
