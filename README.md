# SkyStore — tema Shopify

Tema Shopify (Online Store 2.0, Liquid) para una tienda de ropa, construido a partir del diseño **NORTE Studio**.
Conserva el mismo CSS, tipografías (Archivo, Instrument Sans, JetBrains Mono), colores, animaciones y estructura;
el contenido ahora sale de Shopify (productos, colecciones, variantes, carrito y checkout nativo).

## Instalar en Shopify

**Opción A — subir el .zip**
Panel de Shopify → Tienda online → Temas → Agregar tema → Subir archivo zip.

**Opción B — conectar GitHub (se actualiza con cada cambio)**
Panel de Shopify → Tienda online → Temas → Agregar tema → Conectar desde GitHub →
repo `Worldonline`, rama `shopify-theme`.

En ambos casos el tema queda como borrador: usa **Vista previa** antes de **Publicar**.

## Configuración en 10 minutos

1. **Menús** (Tienda online → Navegación): el encabezado usa `main-menu` y el pie de página `footer`.
2. **Productos**: crea las opciones **Color** y **Talla**. Las opciones llamadas *Color* se muestran como círculos;
   las demás como píldoras. Las tallas agotadas se tachan solas.
   - Colores de los círculos: usa las muestras nativas de Shopify, o escribe `Nombre: #hex` en
     Personalizar → Configuración del tema → Productos → *Colores de muestras*.
   - Asigna una foto a cada variante de color para que la galería cambie al elegir el color.
   - Etiqueta un producto con `nuevo` para mostrar la etiqueta "Nuevo".
3. **Especificaciones** (tabla de la ficha de producto): crea estos metafields de producto
   (Configuración → Metacampos y metaobjetos → Productos), tipo *Texto de una línea*:
   `custom.peso_tela`, `custom.composicion`, `custom.corte`, `custom.hecho_en`.
   Las filas vacías no se muestran. Puedes cambiar los nombres en Personalizar → Producto.
4. **Portada** (Personalizar): elige la colección de "Novedades" y el producto destacado, y cambia las fotos
   del hero y del lookbook. Mientras no elijas nada se muestran las fotos del diseño original como ejemplo.
5. **Filtros de colección**: instala la app gratuita *Search & Discovery* y activa los filtros de talla, color y precio.
6. **Envío gratis**: el monto de la barra del carrito se cambia en Configuración del tema → Carrito.
   Debe coincidir con tu tarifa real en Configuración → Envíos.
7. **Idiomas**: el tema trae español (predeterminado) e inglés. Para traducir tus productos usa la app gratuita
   *Translate & Adapt*; el selector ES/EN aparece solo cuando publicas más de un idioma.
8. **Pagos en cuotas**: el mensaje de Shop Pay en cuotas aparece en la ficha cuando lo activas en Configuración → Pagos.

> Los textos de ejemplo (eslogan, beneficios, valores de la marca) son de muestra: cámbialos en Personalizar
> para que describan tus productos reales.

## Estructura

```
layout/theme.liquid        Plantilla base, fuentes, colores y carrito lateral
sections/                  Hero, colección destacada, producto, lookbook, valores, boletín,
                           encabezado, pie, colección, carrito, búsqueda, blog, páginas
snippets/                  Tarjeta de producto, ficha de producto, líneas del carrito, precio, etc.
templates/*.json           Páginas armadas con secciones (editables desde Personalizar)
assets/skystore.css        Estilos del diseño original
assets/skystore.js         Variantes, galería, carrito lateral (API de carrito de Shopify)
config/                    Configuración del tema (colores, carrito, productos)
locales/                   Textos en español e inglés
```

## Limitaciones conocidas

- El **checkout** es el nativo de Shopify: sin Shopify Plus solo se personalizan logo, colores y fuentes
  (Configuración → Checkout).
- Las fuentes se cargan desde Google Fonts para conservar el ancho variable de Archivo, que no está en la
  biblioteca de fuentes de Shopify.
- La barra de envío gratis usa la moneda principal de la tienda; con varias monedas el monto no se convierte.
