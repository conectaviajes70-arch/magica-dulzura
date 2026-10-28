# Mágica Dulzura D’LISSI — guía de instalación

Esta carpeta contiene una primera versión funcional del catálogo:
- `index.html`: web móvil, catálogo, filtros, modales con carrusel, carrito persistente y pedido por WhatsApp.
- `Code.gs`: backend de Google Apps Script para leer/guardar catálogo en Google Sheets.
- `assets/banner-magica-dulzura.png`: banner de portada, si se incluyó en el paquete.

## Antes de publicarla
1. En `index.html`, busca `WHATSAPP_NUMBER` y verifica el número del negocio. Está configurado como `5586120510` (México, sin `+` ni espacios).
2. Los productos, precios y fotografías son ejemplos. Cámbialos antes de aceptar pedidos reales.
3. La versión inicial permite editar nombre, categoría, precio, descripción e imágenes desde administración. Las imágenes deben tener URL pública directa. Las imágenes de muestra usan Unsplash; reemplázalas por fotos propias cuando puedas.

## Paso A — crear Google Sheets
1. En Android, abre Google Sheets y crea una hoja de cálculo, por ejemplo `Catalogo Magica Dulzura`.
2. Abre la hoja en el navegador. En el menú del navegador puedes activar “Sitio para computadora” si no aparece la opción de Apps Script.
3. Abre **Extensiones → Apps Script**. Borra el código de ejemplo y pega el contenido de `Code.gs`.
4. Guarda el proyecto.
5. Ejecuta la función `setup` desde el selector de funciones. Acepta los permisos que solicita Google. Esto crea la pestaña `Productos` con seis artículos de ejemplo.
6. En Apps Script, abre **Configuración del proyecto → Propiedades del script → Añadir propiedad**:
   - Nombre: `ADMIN_PIN`
   - Valor: crea una clave larga y única. No la publiques ni la pegues en archivos públicos.

## Paso B — publicar Apps Script
1. Pulsa **Implementar → Nueva implementación**.
2. Selecciona tipo **Aplicación web**.
3. Ejecutar como: **tú**.
4. Para una tienda pública, configura el acceso para que los visitantes puedan leer el catálogo. Las opciones disponibles dependen de la cuenta y la política de Google Workspace.
5. Implementa y copia la URL que termina en `/exec`.
6. Prueba abrir la URL en el navegador; debe responder con JSON de productos. Si solicita autorización o no devuelve datos, revisa el despliegue y permisos.

**Seguridad:** el catálogo es público por diseño. La escritura requiere `ADMIN_PIN`. No guardes la clave en `index.html`, ni la compartas. Para mayor seguridad y uso comercial, conviene limitar quién puede editar y revisar periódicamente permisos y registros.

## Paso C — publicar GitHub Pages desde el teléfono
1. En GitHub, crea un repositorio nuevo, por ejemplo `magica-dulzura`.
2. En el repositorio pulsa **Add file → Upload files**.
3. Sube `index.html` y la carpeta `assets` completa. La estructura debe ser:
   ```
   index.html
   assets/
     banner-magica-dulzura.png
   ```
4. Confirma los cambios con **Commit changes**.
5. Ve a **Settings → Pages**.
6. En “Build and deployment”, elige **Deploy from a branch**, selecciona `main` y carpeta `/(root)`, y guarda.
7. Espera a que GitHub Pages publique la dirección que muestra esa sección.

## Paso D — conectar catálogo y probar administración
1. Abre la página publicada.
2. Pulsa el engrane ⚙ de arriba o “Administración” al final.
3. Pega la URL `/exec` de Apps Script y escribe la clave `ADMIN_PIN`.
4. Pulsa “Conectar y cargar productos”.
5. Cambia un precio de prueba y pulsa “Guardar cambios del catálogo”. Recarga la web para confirmar que se reflejó.
6. Prueba agregar un postre, cambiar cantidades, eliminarlo y enviar un pedido de prueba a WhatsApp.

## Cómo cambiar fotos
En el panel de administración, coloca una o más URL públicas directas en “URLs de imágenes”, separadas por comas. La primera imagen es la miniatura del catálogo; las demás aparecen en el carrusel del modal. Las URL deben permitir que el navegador vea la imagen sin iniciar sesión. No uses enlaces privados de Google Drive sin configurar correctamente el acceso y el enlace directo.

## Notas y límites de esta versión
- GitHub Pages aloja archivos estáticos; Apps Script se ocupa de guardar/leer el catálogo.
- El carrito se conserva en el navegador del cliente y no se comparte entre dispositivos.
- WhatsApp abre un mensaje preparado; el cliente debe pulsar enviar y el negocio debe confirmar el pedido.
- No procesa pagos ni confirma inventario automáticamente.
- Si el navegador presenta un error de conexión entre GitHub Pages y Apps Script, verifica que la aplicación web esté desplegada con acceso de lectura apropiado y que la URL termine en `/exec`. Los entornos administrados por escuelas/empresas pueden bloquear acceso público.
- Antes de usarlo en producción, cambia todos los productos, precios, fotos y confirma el WhatsApp de negocio.
