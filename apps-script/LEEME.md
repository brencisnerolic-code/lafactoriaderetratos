# Pedidos, mails y vouchers: puesta en marcha

Todo lo que llega (compras de Mercado Pago, transferencias y regalos) queda en la hoja **Pedidos**, con un mail tuyo por cada pedido. Los regalos además reciben el voucher solos.

Ningún token va en el código: los secretos van en las propiedades del proyecto.

## 1. Script

1. En la planilla: **Extensiones → Apps Script**. Borrá todo lo que haya y pegá el contenido completo de `voucher.gs`. Guardá.
2. Ejecutá **instalarDisparador** una sola vez (elegila arriba y tocá Ejecutar). Te va a pedir permisos: aceptalos. Este paso hace que la casilla "sena_recibida" funcione.

## 2. Propiedades (secretos)

**Configuración del proyecto → Propiedades de la secuencia de comandos → Agregar propiedad**:

| Propiedad | Valor |
| --- | --- |
| `MP_ACCESS_TOKEN` | Token de Mercado Pago. Para probar: el de **prueba** (`TEST-`). Para producción: el real (`APP_USR-`). |
| `OWNER_EMAIL` | Tu mail. |

Para probar un pago ya hecho, agregá también `PRUEBA_PAYMENT_ID` con el ID.

## 3. Publicar la aplicación web

1. **Implementar → Nueva implementación** (o editá la existente → **Nueva versión**), tipo **Aplicación web**.
2. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**.
3. Copiá la URL que termina en `/exec`.

Si ya tenías la implementación, usá **Nueva versión** para que la URL no cambie.

## 4. Conectar la web

En Netlify, **Environment variables**:

| Variable | Valor |
| --- | --- |
| `MP_NOTIFICATION_URL` | La URL `/exec` del paso 3. Para todos los contextos. |

Y en el archivo `js/config.js`, en `pedidos → endpoint`, pegá la misma URL `/exec`. Así las transferencias también te llegan por mail.

Después hacé un nuevo deploy del sitio.

## 5. Cómo se usa

**Compra con Mercado Pago:** cuando se aprueba el pago, llega el mail con todos los datos. Si es regalo, se emite el voucher y le llega al comprador con el PDF.

**Compra por transferencia:**
1. Llega el mail "Transferencia por confirmar" y la fila aparece como *transferencia pendiente*.
2. Cuando veas la seña en tu cuenta, en la planilla tildá la casilla **sena_recibida** de esa fila.
3. Si es regalo, el voucher se emite solo y le llega al comprador por mail. En el mail que te llega a vos aparece un link de WhatsApp para mandárselo al comprador con un toque.

**Canje:** cuando quien recibe te escriba con el código, cambiá `estado` a `canjeado` en la fila correspondiente.

## 6. Probar

1. Con el token de prueba, hacé una compra de regalo con tarjeta de prueba.
2. Revisá la hoja, el mail y el PDF.
3. Probá también una transferencia: tildá la casilla y revisá que salga el voucher.
