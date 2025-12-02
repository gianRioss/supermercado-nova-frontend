# SuperMercado Nova – Proyecto Integrador Etapa 2

SPA desarrollada para el Bootcamp Full Stack.  
Simula un supermercado online con catálogo de productos, carrito de compras y formularios de alta y contacto.

## Tecnologías
- HTML5, CSS3
- JavaScript (ES Modules)
- Fetch + async/await
- MockAPI.io

## Vistas

- **Home (`#/home`)**
  - Obtiene productos desde MockAPI (`GET /productos`).
  - Muestra cards con imagen, precio, marca y categoría.
  - Buscador por nombre, marca o categoría.
  - Botón **“Agregar al carrito”** en cada card.

- **Alta (`#/alta`)**
  - Formulario con validaciones HTML5 (nombre, precio, stock, marca, categoría, descripciones, envío, edades y foto).
  - Crea productos en MockAPI (`POST /productos`).
  - Tabla que lista productos actuales (`GET /productos`) y permite eliminarlos (`DELETE /productos/:id`).

- **Contacto (`#/contacto`)**
  - Formulario con nombre, email y comentarios.
  - Validaciones HTML5 y mensaje de agradecimiento.

- **Nosotros (`#/nosotros`)**
  - Información del proyecto y del sitio.

- **Carrito**
  - Botón de carrito en el header con contador de unidades.
  - Modal que se abre/cierra con botón, click fuera del modal y tecla ESC.
  - Listado de productos con cantidad, subtotal y total.
  - Botones **+**, **–**, eliminar y **Vaciar carrito**.
  - Botón **Confirmar pedido** → guarda el pedido en MockAPI (`POST /carrito`).

## Ejecución

1. Abrir la carpeta del proyecto en VS Code.
2. Levantar un servidor estático (por ejemplo, extensión **Live Server**).
3. Navegar a `index.html#/home`.
4. Verificar que el endpoint de MockAPI configurado en `js/api.js` esté activo.
