# Vouchers de regalo: puesta en marcha

Esto conecta la compra de un regalo con una planilla, un PDF y un mail automático.
Lo hacés una sola vez. Ningún token va en el código: los secretos van en las propiedades del proyecto.

## 1. Crear la planilla y el script

1. Creá una planilla de Google Sheets nueva, por ejemplo "Vouchers La Factoría".
2. Menú **Extensiones → Apps Script**. Borrá lo que aparezca y pegá el contenido de `voucher.gs`. Guardá.

## 2. Propiedades (secretos)

En Apps Script: **Configuración del proyecto → Propiedades de la secuencia → Agregar propiedad**:

| Propiedad | Valor |
| --- | --- |
| `MP_ACCESS_TOKEN` | Tu Access Token de **producción** de Mercado Pago (el mismo que usa Netlify). |
| `OWNER_EMAIL` | El mail donde querés recibir la copia de cada voucher. |

Opcional, para probar sin pagar de verdad: `PRUEBA_PAYMENT_ID` con el ID de un pago de prueba.

## 3. Publicar como web app

1. **Implementar → Nueva implementación → Tipo: Aplicación web**.
2. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**. (Mercado Pago tiene que poder llamarla.)
3. Copiá la **URL de la aplicación web** (termina en `/exec`).

## 4. Avisarle a la web

En Netlify: **Site settings → Environment variables**, agregá:

| Variable | Valor |
| --- | --- |
| `MP_NOTIFICATION_URL` | La URL `/exec` del paso 3. |

Después hacé un nuevo deploy del sitio para que tome la variable.

Con esto, cada pago de regalo que se aprueba en Mercado Pago llama al script. No hace falta configurar nada más en el panel de Mercado Pago.

## 5. Probar

1. Con el token de **prueba** de Mercado Pago, hacé un regalo en el sitio y pagá con una tarjeta de prueba.
2. En el editor de Apps Script, ejecutá `probarConPagoId` (con `PRUEBA_PAYMENT_ID` cargada). Mirá el registro: **Ejecuciones**.
3. Revisá la hoja "Vouchers", la carpeta "Vouchers emitidos" en Drive y el mail.

## Canje

Cuando la persona te escriba con el código, buscalo en la columna `codigo` y cambiá `estado` a `canjeado`.
