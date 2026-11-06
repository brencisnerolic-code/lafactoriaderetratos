/**
 * voucher.gs — Google Apps Script de La Factoría de Retratos.
 *
 * Hace tres cosas:
 *   1. Pedidos: cada compra aprobada por Mercado Pago, y cada transferencia que avisa la web,
 *      queda en la hoja "Pedidos" y te llega un mail con todos los datos.
 *   2. Regalos: cuando un regalo está pagado (Mercado Pago aprobado, o tildás "seña recibida"
 *      en la planilla si fue por transferencia), se emite el voucher: código, PDF y mail al comprador.
 *   3. Nada de secretos en este archivo: el token va en las propiedades del proyecto.
 *
 * Instalación y configuración: ver apps-script/LEEME.md
 */

var CONFIG = {
  SITE_URL: "https://lafactoriaderetratos.com",
  WHATSAPP: "5491130509450",
  VIGENCIA_MESES: 6,
  HOJA: "Pedidos",
  ZONA: "America/Argentina/Buenos_Aires"
};

var COLUMNAS = [
  "pedido", "fecha", "metodo", "tipo", "comprador", "email", "telefono", "mascota",
  "receptor", "mensaje_regalo", "notas", "referido", "detalle", "total_ars", "sena_ars",
  "mp_payment_id", "sena_recibida", "estado", "voucher_codigo", "voucher_pdf", "vence"
];

// ---------- Entradas ----------

// Mercado Pago (notificación) y la web (transferencia) llegan por POST.
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var cuerpo = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (cuerpo.action === "transferencia") {
      registrarTransferencia_(cuerpo);
    } else if (cuerpo.data && cuerpo.data.id) {
      procesarPagoMP_(String(cuerpo.data.id));
    }
  } catch (err) {
    console.error(err);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

// Se ejecuta sola cada vez que editás la planilla (se instala con instalarDisparador).
function alEditarPlanilla(e) {
  try {
    var hoja = e.range.getSheet();
    if (hoja.getName() !== CONFIG.HOJA || e.range.getRow() < 2) return;
    var mapa = mapaColumnas_(hoja);
    if (e.range.getColumn() !== mapa.sena_recibida) return;
    if (e.value !== "TRUE" && e.value !== true) return;
    var fila = e.range.getRow();
    var datos = filaComoObjeto_(hoja, fila, mapa);
    hoja.getRange(fila, mapa.estado).setValue("seña recibida");
    if (datos.tipo === "regalo" && !datos.voucher_codigo) emitirVoucher_(hoja, fila, mapa);
  } catch (err) {
    console.error(err);
  }
}

// Ejecutar una sola vez desde el editor: crea el disparador que escucha las ediciones.
function instalarDisparador() {
  var existe = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === "alEditarPlanilla";
  });
  if (!existe) {
    ScriptApp.newTrigger("alEditarPlanilla").forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  }
}

// ---------- Mercado Pago ----------

function procesarPagoMP_(paymentId) {
  var pago = consultarPago_(paymentId);
  if (!pago || pago.status !== "approved") return;
  var hoja = obtenerHoja_();
  var mapa = mapaColumnas_(hoja);
  if (yaRegistrado_(hoja, mapa, "mp_payment_id", paymentId)) return;

  var meta = pago.metadata || {};
  var datos = {
    pedido: meta.order || pago.external_reference || "",
    metodo: "mercadopago",
    tipo: meta.type === "gift" ? "regalo" : "retrato",
    comprador: meta.buyer_name || (pago.payer && pago.payer.first_name) || "",
    email: meta.buyer_email || (pago.payer && pago.payer.email) || "",
    telefono: meta.buyer_phone || "",
    mascota: meta.pet_name || "",
    receptor: meta.receiver_name || "",
    mensaje_regalo: meta.message || "",
    notas: meta.notes || "",
    referido: meta.referral || "",
    detalle: meta.selection || "",
    total_ars: meta.total || "",
    sena_ars: pago.transaction_amount || "",
    mp_payment_id: paymentId,
    estado: "pagado"
  };
  var fila = agregarFila_(hoja, mapa, datos, true);
  avisarPedido_("Nuevo pedido pagado " + datos.pedido, datos);
  if (datos.tipo === "regalo") emitirVoucher_(hoja, fila, mapa);
}

// ---------- Transferencia ----------

function registrarTransferencia_(datos) {
  var hoja = obtenerHoja_();
  var mapa = mapaColumnas_(hoja);
  if (yaRegistrado_(hoja, mapa, "pedido", datos.order)) return;
  var fila = agregarFila_(hoja, mapa, {
    pedido: datos.order || "",
    metodo: "transferencia",
    tipo: datos.type === "gift" ? "regalo" : "retrato",
    comprador: datos.buyer_name || "",
    email: datos.buyer_email || "",
    telefono: datos.buyer_phone || "",
    mascota: datos.pet_name || "",
    receptor: datos.receiver_name || "",
    mensaje_regalo: datos.message || "",
    notas: datos.notes || "",
    referido: datos.referral || "",
    detalle: datos.selection || "",
    total_ars: datos.total || "",
    sena_ars: datos.deposit || "",
    estado: "transferencia pendiente"
  }, false);
  avisarPedido_("Transferencia por confirmar " + datos.order, datos);
  // Recordatorio: cuando veas la seña en tu cuenta, tildá "sena_recibida" en la fila.
  GmailApp.sendEmail(
    propiedad_("OWNER_EMAIL"),
    "Para confirmar: tildá la seña en la fila " + fila,
    "Cuando recibas la seña de " + datos.order + " tildá la casilla sena_recibida (fila " + fila + ") en la planilla " +
      SpreadsheetApp.getActive().getUrl()
  );
}

// ---------- Voucher ----------

function emitirVoucher_(hoja, fila, mapa) {
  var datos = filaComoObjeto_(hoja, fila, mapa);
  if (datos.voucher_codigo) return;

  var hoy = new Date();
  var vence = new Date(hoy.getFullYear(), hoy.getMonth() + CONFIG.VIGENCIA_MESES, hoy.getDate());
  var codigo = generarCodigo_(hoja, mapa);
  var pdf = generarPdf_({
    codigo: codigo,
    receptor: datos.receptor,
    comprador: datos.comprador,
    mensaje: datos.mensaje_regalo,
    detalle: datos.detalle,
    vence: vence
  });
  var url = guardarPdf_(pdf, codigo);

  hoja.getRange(fila, mapa.voucher_codigo).setValue(codigo);
  hoja.getRange(fila, mapa.voucher_pdf).setValue(url);
  hoja.getRange(fila, mapa.vence).setValue(vence);
  hoja.getRange(fila, mapa.estado).setValue("voucher emitido");

  if (datos.email) {
    GmailApp.sendEmail(
      datos.email,
      "Tu voucher de regalo de La Factoría de Retratos",
      textoMailVoucher_(codigo, datos.receptor, vence),
      { attachments: [pdf], name: "La Factoría de Retratos" }
    );
  }
  GmailApp.sendEmail(
    propiedad_("OWNER_EMAIL"),
    "Voucher emitido " + codigo + " (" + datos.receptor + ")",
    "Comprador: " + datos.comprador + " <" + datos.email + ">\n" +
      "Teléfono: " + datos.telefono + "\n" +
      "Detalle: " + datos.detalle + "\n" +
      "PDF: " + url + "\n\n" +
      "Para mandárselo por WhatsApp al comprador, tocá este link:\n" + linkWhatsappVoucher_(datos.telefono, codigo)
  );
}

function generarCodigo_(hoja, mapa) {
  var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var usados = {};
  var ultima = hoja.getLastRow();
  if (ultima > 1) {
    hoja.getRange(2, mapa.voucher_codigo, ultima - 1, 1).getValues().forEach(function (r) {
      usados[String(r[0])] = true;
    });
  }
  var codigo;
  do {
    codigo = "FACT-" + bloque_(letras) + "-" + bloque_(letras);
  } while (usados[codigo]);
  return codigo;
}

function bloque_(letras) {
  var s = "";
  for (var i = 0; i < 4; i++) s += letras.charAt(Math.floor(Math.random() * letras.length));
  return s;
}

function generarPdf_(d) {
  var doc = DocumentApp.create("Voucher " + d.codigo);
  var cuerpo = doc.getBody();
  cuerpo.clear();
  var fecha = Utilities.formatDate(d.vence, CONFIG.ZONA, "dd/MM/yyyy");
  cuerpo.appendParagraph("La Factoría de Retratos").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  cuerpo.appendParagraph("Voucher de regalo").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  cuerpo.appendParagraph("Para: " + d.receptor + "  ·  De: " + d.comprador);
  if (d.mensaje) cuerpo.appendParagraph("“" + d.mensaje + "”");
  cuerpo.appendParagraph("Un retrato hiperrealista de tu mascota, pintado a mano. " + d.detalle +
    ". Marco de madera Kiri con vidrio, listo para colgar. Envío gratis a todo el país.");
  cuerpo.appendParagraph("Código: " + d.codigo).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  cuerpo.appendParagraph("Cómo canjearlo: escribinos por WhatsApp con tu código y la foto de tu mascota. " +
    "Revisamos los detalles juntos. El retrato se entrega al completar el saldo.");
  cuerpo.appendParagraph("WhatsApp: " + linkWhatsappVoucher_("", d.codigo));
  cuerpo.appendParagraph("Válido hasta el " + fecha + ".");
  cuerpo.appendParagraph("lafactoriaderetratos.com · @lafactoriaderetratos");
  doc.saveAndClose();

  var archivo = DriveApp.getFileById(doc.getId());
  var pdf = archivo.getAs(MimeType.PDF).setName(d.codigo + ".pdf");
  archivo.setTrashed(true);
  return pdf;
}

function guardarPdf_(pdf, codigo) {
  var carpeta = obtenerCarpeta_("Vouchers emitidos");
  return carpeta.createFile(pdf.copyBlob().setName(codigo + ".pdf")).getUrl();
}

function linkWhatsappVoucher_(telefono, codigo) {
  var numero = String(telefono || "").replace(/\D/g, "");
  var texto = "Hola, te envío tu voucher de regalo de La Factoría de Retratos. Tu código es " + codigo + ".";
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
}

function textoMailVoucher_(codigo, receptor, vence) {
  var fecha = Utilities.formatDate(vence, CONFIG.ZONA, "dd/MM/yyyy");
  return "¡Gracias por tu compra!\n\n" +
    "Adjuntamos tu voucher de regalo para " + receptor + ".\n" +
    "Código: " + codigo + "\n" +
    "Válido hasta el " + fecha + ".\n\n" +
    "Quien lo recibe nos escribe por WhatsApp con el código y la foto de su mascota. " +
    "Revisamos los detalles juntos y empezamos a pintar.\n\n" +
    "La Factoría de Retratos · lafactoriaderetratos.com";
}

// ---------- Avisos ----------

function avisarPedido_(asunto, d) {
  GmailApp.sendEmail(propiedad_("OWNER_EMAIL"), asunto, textoResumen_(d));
}

function textoResumen_(d) {
  return "Pedido: " + (d.order || d.pedido || "-") + "\n" +
    "Método: " + (d.metodo || (d.type === "gift" ? "regalo" : "")) + "\n" +
    "Tipo: " + (d.type === "gift" || d.tipo === "regalo" ? "REGALO" : "retrato") + "\n" +
    "Comprador: " + (d.buyer_name || d.comprador || "-") + "\n" +
    "Email: " + (d.buyer_email || d.email || "-") + "\n" +
    "Teléfono: " + (d.buyer_phone || d.telefono || "-") + "\n" +
    "Mascota: " + (d.pet_name || d.mascota || "-") + "\n" +
    "Detalle: " + (d.selection || d.detalle || "-") + "\n" +
    "Seña: " + (d.deposit || d.sena_ars || "-") + " ARS · Total: " + (d.total || d.total_ars || "-") + " ARS\n" +
    "Notas: " + (d.notes || d.notas || "-") + "\n" +
    "Cómo nos conoció: " + (d.referral || d.referido || "-") + "\n" +
    ((d.receiver_name || d.receptor) ? "Quien recibe: " + (d.receiver_name || d.receptor) + "\n" : "") +
    ((d.message || d.mensaje_regalo) ? "Mensaje: " + (d.message || d.mensaje_regalo) + "\n" : "");
}

// ---------- Planilla ----------

function obtenerHoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(CONFIG.HOJA);
  if (!hoja) {
    hoja = ss.insertSheet(CONFIG.HOJA);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function mapaColumnas_(hoja) {
  var encabezados = hoja.getRange(1, 1, 1, COLUMNAS.length).getValues()[0];
  var mapa = {};
  COLUMNAS.forEach(function (nombre) {
    mapa[nombre] = encabezados.indexOf(nombre) + 1;
  });
  return mapa;
}

function agregarFila_(hoja, mapa, datos, pagado) {
  var fila = hoja.getLastRow() + 1;
  var valores = COLUMNAS.map(function (nombre) {
    if (nombre === "fecha") return new Date();
    if (nombre === "sena_recibida") return pagado;
    return datos[nombre] !== undefined ? datos[nombre] : "";
  });
  hoja.getRange(fila, 1, 1, COLUMNAS.length).setValues([valores]);
  // Casilla para tildar la seña en transferencias.
  hoja.getRange(fila, mapa.sena_recibida).insertCheckboxes();
  if (pagado) hoja.getRange(fila, mapa.sena_recibida).setValue(true);
  return fila;
}

function filaComoObjeto_(hoja, fila, mapa) {
  var valores = hoja.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0];
  var obj = {};
  COLUMNAS.forEach(function (nombre, i) { obj[nombre] = valores[i]; });
  return obj;
}

function yaRegistrado_(hoja, mapa, columna, valor) {
  var ultima = hoja.getLastRow();
  if (ultima < 2 || !valor) return false;
  var celdas = hoja.getRange(2, mapa[columna], ultima - 1, 1).getValues();
  return celdas.some(function (r) { return String(r[0]) === String(valor); });
}

// ---------- Mercado Pago API y Drive ----------

function consultarPago_(paymentId) {
  var res = UrlFetchApp.fetch("https://api.mercadopago.com/v1/payments/" + encodeURIComponent(paymentId), {
    method: "get",
    headers: { Authorization: "Bearer " + propiedad_("MP_ACCESS_TOKEN") },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) return null;
  return JSON.parse(res.getContentText());
}

function propiedad_(nombre) {
  var valor = PropertiesService.getScriptProperties().getProperty(nombre);
  if (!valor) throw new Error("Falta la propiedad " + nombre);
  return valor;
}

function obtenerCarpeta_(nombre) {
  var it = DriveApp.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nombre);
}

// ---------- Prueba manual ----------

// Editor → Ejecutar → probarConPagoId (con la propiedad PRUEBA_PAYMENT_ID cargada).
function probarConPagoId() {
  procesarPagoMP_(propiedad_("PRUEBA_PAYMENT_ID"));
}
