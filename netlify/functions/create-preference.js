/**
 * create-preference — Netlify Function.
 *
 * Creates a Mercado Pago Checkout Pro preference server-side, where the
 * secret MP_ACCESS_TOKEN can live safely (as a Netlify env var, never in
 * client code). Returns the hosted checkout URL (init_point) for the
 * browser to redirect to.
 *
 * Setup: Netlify site settings → Environment variables → add MP_ACCESS_TOKEN
 * with the Access Token from https://www.mercadopago.com.ar/developers/panel
 */
const MP_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "MP_ACCESS_TOKEN no está configurado en las variables de entorno de Netlify."
      })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Body inválido" }) };
  }

  const { title, unitPrice, quantity, payer, externalReference, siteUrl } = payload;

  if (!title || typeof unitPrice !== "number" || unitPrice <= 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos del pedido (title / unitPrice)." }) };
  }

  const origin = siteUrl || (event.headers && event.headers.origin) || "";

  const preferenceBody = {
    items: [
      {
        title: String(title).slice(0, 256),
        quantity: quantity && quantity > 0 ? quantity : 1,
        currency_id: "ARS",
        unit_price: unitPrice
      }
    ],
    payer: {
      name: payer && payer.name ? String(payer.name).slice(0, 128) : undefined,
      email: payer && payer.email ? String(payer.email).slice(0, 128) : undefined,
      phone: payer && payer.phone ? { number: String(payer.phone).slice(0, 32) } : undefined
    },
    external_reference: externalReference || undefined,
    back_urls: origin
      ? {
          success: `${origin}/gracias.html`,
          pending: `${origin}/gracias.html`,
          failure: `${origin}/#checkout`
        }
      : undefined,
    auto_return: origin ? "approved" : undefined
  };

  try {
    const mpResponse = await fetch(MP_PREFERENCES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(preferenceBody)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return {
        statusCode: mpResponse.status,
        body: JSON.stringify({ error: data.message || "Mercado Pago rechazó la preferencia.", details: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ id: data.id, initPoint: data.init_point, sandboxInitPoint: data.sandbox_init_point })
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "No se pudo contactar a Mercado Pago.", details: String(err) }) };
  }
};
