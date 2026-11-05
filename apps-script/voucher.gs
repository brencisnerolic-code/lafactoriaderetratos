/**
 * voucher.gs — Google Apps Script para los vouchers de regalo de La Factoría.
 *
 * Qué hace:
 *   1. Mercado Pago avisa (POST) a esta web app cuando cambia un pago.
 *   2. Vuelve a consultar el pago en la API de Mercado Pago (no confía en el aviso).
 *   3. Si el pago es de un regalo y está aprobado, emite un voucher:
 *      código FACT-XXXX-XXXX, fila en la planilla, PDF y mail al comprador
 *      (con copia a La Factoría).
 *
 * Vive en la planilla de Google: Extensiones → Apps Script → pegar este archivo.
 * Configuración en: Configuración del proyecto → Propiedades de la secuencia
 * (ver apps-script/LEEME.md). Ningún token va en este archivo.
 */

var CONFIG = {
  WHATSAPP_CANJE: "5491130509450",
  SITE_URL: "https://lafactoriaderetratos.com",
  VIGENCIA_MESES: 6,
  NOMBRE_HOJA: "Vouchers"
};

var COLUMNAS = [
  "codigo", "emitido", "vence", "comprador", "email_comprador", "receptor",
  "mensaje", "detalle_retrato", "monto_ars", "mp_payment_id", "estado", "pdf_url"
];

// ---------- Entrada desde Mercado Pago ----------

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var aviso = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var paymentId = (aviso.data && aviso.data.id) || (e.parameter && e.parameter["data.id"]);
    if (!paymentId || (aviso.type && aviso.type !== "payment")) return ok_();

    var pago = consultarPago_(paymentId);
    if (!pago) return ok_();
    if (pago.status !== "approved") return ok_();
    if (!pago.external_reference || String(pago.external_reference).indexOf("GIFT-") !== 0) return ok_();

    emitirVoucher_(pago);
  } catch (err) {
    // Respondemos 200 igual para que Mercado Pago no reintente sin fin; el error queda en el registro.
    console.error(err);
  } finally {
    lock.releaseLock();
  }
  return ok_();
}

function ok_() {
  return ContentService.createTextOutput("ok");
}

function consultarPago_(paymentId) {
  var token = PropertiesService.getScriptProperties().getProperty("MP_ACCESS_TOKEN");
  if (!token) throw new Error("Falta la propiedad MP_ACCESS_TOKEN");
  var res = UrlFetchApp.fetch("https://api.mercadopago.com/v1/payments/" + encodeURIComponent(paymentId), {
    method: "get",
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) return null;
  return JSON.parse(res.getContentText());
}

// ---------- Emisión ----------

function emitirVoucher_(pago) {
  var hoja = obtenerHoja_();
  var paymentId = String(pago.id);

  // Idempotencia: si ya emitimos este pago, no hacemos nada.
  var filas = hoja.getDataRange().getValues();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][COLUMNAS.indexOf("mp_payment_id")]) === paymentId) return;
  }

  var meta = pago.metadata || {};
  var hoy = new Date();
  var vence = new Date(hoy.getFullYear(), hoy.getMonth() + CONFIG.VIGENCIA_MESES, hoy.getDate());
  var codigo = generarCodigo_(filas);
  var comprador = meta.buyer_name || (pago.payer && pago.payer.first_name) || "";
  var emailComprador = (pago.payer && pago.payer.email) || meta.buyer_email || "";
  var receptor = meta.receiver_name || "";
  var mensaje = meta.message || "";
  var detalle = meta.selection || "";
  var monto = pago.transaction_amount || 0;

  var pdf = generarPdf_({
    codigo: codigo, receptor: receptor, comprador: comprador, mensaje: mensaje,
    detalle: detalle, vence: vence
  });
  var pdfUrl = guardarPdf_(pdf, codigo);

  hoja.appendRow([
    codigo, hoy, vence, comprador, emailComprador, receptor,
    mensaje, detalle, monto, paymentId, "emitido", pdfUrl
  ]);

  if (emailComprador) {
    GmailApp.sendEmail(
      emailComprador,
      "Tu voucher de regalo de La Factoría de Retratos",
      textoMailComprador_(codigo, receptor, vence),
      { attachments: [pdf], name: "La Factoría de Retratos" }
    );
  }
  var owner = PropertiesService.getScriptProperties().getProperty("OWNER_EMAIL");
  if (owner) {
    GmailApp.sendEmail(
      owner,
      "Nuevo voucher " + codigo + " (" + receptor + ")",
      "Comprador: " + comprador + " <" + emailComprador + ">\n" +
      "Receptor: " + receptor + "\n" +
      "Detalle: " + detalle + "\n" +
      "Monto: $" + monto + " ARS\n" +
      "Mensaje: " + (mensaje || "-") + "\n" +
      "Pago Mercado Pago: " + paymentId + "\n" +
      "PDF: " + pdfUrl
    );
  }
}

function obtenerHoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!hoja) {
    hoja = ss.insertSheet(CONFIG.NOMBRE_HOJA);
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

// Sin 0, O, 1 ni I para que no se confundan al leerlo.
function generarCodigo_(filasExistentes) {
  var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var existentes = {};
  for (var i = 1; i < filasExistentes.length; i++) existentes[String(filasExistentes[i][0])] = true;
  var codigo;
  do {
    var parte = function () {
      var s = "";
      for (var j = 0; j < 4; j++) s += letras.charAt(Math.floor(Math.random() * letras.length));
      return s;
    };
    codigo = "FACT-" + parte() + "-" + parte();
  } while (existentes[codigo]);
  return codigo;
}

// ---------- PDF (Google Doc convertido a PDF; no requiere librerías externas) ----------

function generarPdf_(d) {
  var doc = DocumentApp.create("Voucher " + d.codigo);
  var cuerpo = doc.getBody();
  cuerpo.clear();
  var fecha = Utilities.formatDate(d.vence, "America/Argentina/Buenos_Aires", "dd/MM/yyyy");
  cuerpo.appendParagraph("La Factoría de Retratos").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  cuerpo.appendParagraph("Voucher de regalo").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  cuerpo.appendParagraph("Para: " + d.receptor + "  ·  De: " + d.comprador);
  if (d.mensaje) cuerpo.appendParagraph("“" + d.mensaje + "”");
  cuerpo.appendParagraph("Tu retrato hiperrealista de mascota, pintado a mano. " + d.detalle +
    ". Marco de madera Kiri con vidrio, listo para colgar. Envío gratis a todo el país.");
  cuerpo.appendParagraph("Código: " + d.codigo).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  var wa = "https://wa.me/" + CONFIG.WHATSAPP_CANJE + "?text=" + encodeURIComponent(
    "Hola, recibí un voucher de regalo de La Factoría de Retratos. Mi código es " + d.codigo + ".");
  cuerpo.appendParagraph("Cómo canjearlo: escribinos por WhatsApp con tu código y la foto de tu mascota. Revisamos los detalles juntos y empezamos a pintar.");
  cuerpo.appendParagraph("WhatsApp: " + wa);
  cuerpo.appendParagraph("Válido hasta el " + fecha + ".");
  cuerpo.appendParagraph("lafactoriaderetratos.com · @lafactoriaderetratos");
  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  var pdf = file.getAs(MimeType.PDF).setName(d.codigo + ".pdf");
  file.setTrashed(true);
  return pdf;
}

function guardarPdf_(pdf, codigo) {
  var carpeta = obtenerCarpeta_("Vouchers emitidos");
  var archivo = carpeta.createFile(pdf.copyBlob().setName(codigo + ".pdf"));
  return archivo.getUrl();
}

function obtenerCarpeta_(nombre) {
  var it = DriveApp.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nombre);
}

function textoMailComprador_(codigo, receptor, vence) {
  var fecha = Utilities.formatDate(vence, "America/Argentina/Buenos_Aires", "dd/MM/yyyy");
  return "¡Gracias por tu compra!\n\n" +
    "Adjuntamos tu voucher de regalo para " + receptor + ".\n" +
    "Código: " + codigo + "\n" +
    "Válido hasta el " + fecha + ".\n\n" +
    "Quien lo recibe nos escribe por WhatsApp con el código y la foto de su mascota. " +
    "Revisamos los detalles juntos y empezamos a pintar.\n\n" +
    "La Factoría de Retratos · lafactoriaderetratos.com";
}

// ---------- Prueba manual (desde el editor: Ejecutar → probarConPagoId) ----------

function probarConPagoId() {
  var id = PropertiesService.getScriptProperties().getProperty("PRUEBA_PAYMENT_ID");
  if (!id) throw new Error("Cargá la propiedad PRUEBA_PAYMENT_ID con un ID de pago de prueba");
  var pago = consultarPago_(id);
  Logger.log(JSON.stringify(pago && { status: pago.status, ref: pago.external_reference }));
  if (pago && pago.status === "approved") emitirVoucher_(pago);
}
