// js/main.js
import { api } from './api.js';

// ===============
// Datos demo (fallback si falla backend)
// ===============
const productosDemo = [
  {
    id: '1',
    nombre: 'Leche Entera 1L',
    precio: 1799.99,
    stock: 30,
    marca: 'La Serenísima',
    categoria: 'Lácteos',
    descCorta: 'Leche entera larga vida 1 litro.',
    envio: false,
    foto: 'public/leche.png'
  },
  {
    id: '2',
    nombre: 'Detergente Limón 750ml',
    precio: 1490,
    stock: 15,
    marca: 'Cif',
    categoria: 'Limpieza',
    descCorta: 'Detergente concentrado con aroma a limón.',
    envio: true,
    foto: 'public/cif.png'
  },
  {
    id: '3',
    nombre: 'Yerba Mate 1Kg',
    precio: 4890,
    stock: 20,
    marca: 'Rosamonte',
    categoria: 'Almacén',
    descCorta: 'Yerba mate con palo, sabor clásico.',
    envio: false,
    foto: 'public/yerba.jpg'
  }
];

let productosCache = []; // para HOME
let catalogoAlta = []; // para ALTA
let carrito = []; // para el carrito

// ===============
// Helpers HOME
// ===============
function renderProductCards (container, lista) {
  if (!container) return;

  if (!lista.length) {
    container.innerHTML = '<p>No hay productos para mostrar.</p>';
    return;
  }

  container.setAttribute('aria-busy', 'true');

  const html = lista.map(p => `
    <article class="card">
      <div class="card__media">
        <img src="${p.foto || ''}" alt="${p.nombre}" loading="lazy" />
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.nombre}</h3>
        <div class="card__price">
          $ ${Number(p.precio).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
        <p class="card__desc">${p.descCorta || ''}</p>
        <div class="card__tags">
          <span class="tag">${p.marca || ''}</span>
          <span class="tag">${p.categoria || ''}</span>
          ${p.envio ? '<span class="tag">Envío sin cargo</span>' : ''}
        </div>
      </div>
      <div class="card__actions">
        <button
          class="btn btn-add-cart"
          type="button"
          data-id="${p.id}"
        >
          Agregar al carrito
        </button>
        <button class="btn btn--ghost" type="button">Ver más</button>
      </div>
    </article>
  `).join('');

  container.innerHTML = html;
  container.setAttribute('aria-busy', 'false');

  // Botones "Agregar al carrito"
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const producto = lista.find(p => String(p.id) === String(id));
      if (producto) {
        agregarAlCarrito(producto);
      }
    });
  });
}

// ===============
// Lógica de carrito
// ===============
function calcularTotalCarrito () {
  return carrito.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );
}

function actualizarBadgeCarrito () {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const totalUnidades = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );
  badge.textContent = String(totalUnidades);
}

function agregarAlCarrito (producto) {
  const existente = carrito.find(
    item => String(item.id) === String(producto.id)
  );
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarBadgeCarrito();
}

function renderCarrito () {
  const body = document.getElementById('cartBody');
  const totalEl = document.getElementById('cartTotal');
  if (!body || !totalEl) return;

  if (!carrito.length) {
    body.innerHTML = '<p>Tu carrito está vacío.</p>';
    totalEl.textContent = '$ 0,00';
    return;
  }

  const filas = carrito.map(item => `
    <tr data-id="${item.id}">
      <td><img src="${item.foto || ''}" alt="${item.nombre}" /></td>
      <td>${item.nombre}</td>
      <td>$ ${Number(item.precio).toLocaleString('es-AR', {
        minimumFractionDigits: 2
      })}</td>
      <td>
        <div class="cart-qty">
          <button class="btn btn--ghost btn-cart-minus" type="button">-</button>
          <span>${item.cantidad}</span>
          <button class="btn btn--ghost btn-cart-plus" type="button">+</button>
        </div>
      </td>
      <td>$ ${(Number(item.precio) * item.cantidad).toLocaleString('es-AR', {
        minimumFractionDigits: 2
      })}</td>
      <td>
        <button class="btn btn--danger btn-cart-remove" type="button">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');

  body.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;

  const total = calcularTotalCarrito();
  totalEl.textContent = `$ ${total.toLocaleString('es-AR', {
    minimumFractionDigits: 2
  })}`;

  const tbody = body.querySelector('tbody');

  // +
  tbody.querySelectorAll('.btn-cart-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;
      const item = carrito.find(i => String(i.id) === String(id));
      if (item) {
        item.cantidad += 1;
        renderCarrito();
        actualizarBadgeCarrito();
      }
    });
  });

  // -
  tbody.querySelectorAll('.btn-cart-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;
      const item = carrito.find(i => String(i.id) === String(id));
      if (item && item.cantidad > 1) {
        item.cantidad -= 1;
      } else if (item) {
        carrito = carrito.filter(i => String(i.id) !== String(id));
      }
      renderCarrito();
      actualizarBadgeCarrito();
    });
  });

  // eliminar
  tbody.querySelectorAll('.btn-cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;
      carrito = carrito.filter(i => String(i.id) !== String(id));
      renderCarrito();
      actualizarBadgeCarrito();
    });
  });
}

function abrirCarrito () {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;
  renderCarrito();
  overlay.classList.remove('hidden');
}

function cerrarCarrito () {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
}

// ===============
// VISTA HOME
// ===============
async function renderHome () {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1 class="h1">Ofertas destacadas</h1>
    <section id="cards" class="grid-cards" aria-live="polite" aria-busy="false"></section>
  `;

  const grid = document.getElementById('cards');

  try {
    const productos = await api.getProductos();
    // Normalizamos id: siempre tendrá .id (venga de Mongo o del demo)
    productosCache = productos.map(p => ({
      ...p,
      id: p._id || p.id
    }));

    renderProductCards(grid, productosCache);
  } catch (err) {
    console.error('Error al obtener productos del backend, usando demo:', err);
    productosCache = productosDemo;
    renderProductCards(grid, productosCache);
  }

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');

  if (form && input && !form.dataset.boundToHome) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = input.value.trim().toLowerCase();

      const filtrados = productosCache.filter(p =>
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.marca || '').toLowerCase().includes(q) ||
        (p.categoria || '').toLowerCase().includes(q)
      );

      const currentGrid = document.getElementById('cards');
      if (currentGrid) {
        renderProductCards(currentGrid, filtrados);
      }
    });

    form.dataset.boundToHome = 'true';
  }
}

// ===============
// VISTA ALTA
// ===============
function renderTablaAlta (tbody) {
  if (!tbody) return;

  if (!catalogoAlta.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center">No hay productos cargados.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = catalogoAlta.map(p => `
    <tr data-id="${p.id}">
      <td><img src="${p.foto || ''}" alt="${p.nombre}" /></td>
      <td>${p.nombre}</td>
      <td>$ ${Number(p.precio).toLocaleString('es-AR', {
        minimumFractionDigits: 2
      })}</td>
      <td>${p.stock}</td>
      <td>${p.marca}</td>
      <td>${p.categoria}</td>
      <td>${p.envio ? 'Sí' : 'No'}</td>
      <td>
        <button class="btn btn--danger btn-eliminar" type="button">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;
      if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;

      try {
        await api.deleteProducto(id);
        catalogoAlta = catalogoAlta.filter(p => p.id !== id);
        renderTablaAlta(tbody);
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        window.alert('Error al eliminar el producto.');
      }
    });
  });
}

async function cargarProductosAlta (tbody) {
  try {
    const productos = await api.getProductos();
    catalogoAlta = productos.map(p => ({
      ...p,
      id: p._id || p.id
    }));
  } catch (err) {
    console.error('Error al obtener productos en Alta, usando demo:', err);
    catalogoAlta = productosDemo;
  }
  renderTablaAlta(tbody);
}

async function renderAlta () {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1 class="h1">Alta de productos</h1>

    <form id="formAlta" class="form" aria-describedby="ayudaAlta">
      <p id="ayudaAlta" class="hint">
        Completá los campos obligatorios (<strong>*</strong>). 
        Los productos se guardan en la API en el recurso <code>/api/productos</code>.
      </p>

      <div class="form__row">
        <label for="nombre">Nombre *</label>
        <input id="nombre" name="nombre" type="text" required minlength="3" maxlength="60" placeholder="Leche Entera 1L" />
      </div>

      <div class="form__row">
        <label for="precio">Precio *</label>
        <input id="precio" name="precio" type="number" required min="0" step="0.01" inputmode="decimal" placeholder="1799.99" />
      </div>

      <div class="form__row">
        <label for="stock">Stock *</label>
        <input id="stock" name="stock" type="number" required min="0" step="1" inputmode="numeric" placeholder="30" />
      </div>

      <div class="form__row">
        <label for="marca">Marca *</label>
        <input id="marca" name="marca" type="text" required maxlength="40" placeholder="La Serenísima" />
      </div>

      <div class="form__row">
        <label for="categoria">Categoría *</label>
        <select id="categoria" name="categoria" required>
          <option value="" selected disabled>Elegir…</option>
          <option value="Lácteos">Lácteos</option>
          <option value="Limpieza">Limpieza</option>
          <option value="Almacén">Almacén</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Perfumería">Perfumería</option>
        </select>
      </div>

      <div class="form__row">
        <label for="descCorta">Descripción corta *</label>
        <textarea id="descCorta" name="descCorta" required minlength="10" maxlength="120" rows="2" placeholder="Leche entera larga vida."></textarea>
      </div>

      <div class="form__row">
        <label for="descLarga">Descripción larga *</label>
        <textarea id="descLarga" name="descLarga" required minlength="20" maxlength="500" rows="4" placeholder="Leche entera UAT 1 litro. Libre de gluten..."></textarea>
      </div>

      <div class="form__row form__row--inline">
        <label class="checkbox">
          <input id="envio" name="envio" type="checkbox" />
          <span>Envío sin cargo</span>
        </label>
      </div>

      <div class="form__row form__row--inline">
        <div>
          <label for="edadDesde">Edad desde</label>
          <input id="edadDesde" name="edadDesde" type="number" min="0" max="120" />
        </div>
        <div>
          <label for="edadHasta">Edad hasta</label>
          <input id="edadHasta" name="edadHasta" type="number" min="0" max="120" />
        </div>
      </div>

      <div class="form__row">
        <label for="foto">Foto (URL o ruta local) *</label>
        <input id="foto" name="foto" type="text" required placeholder="public/leche.png" />
        <div class="preview-wrapper">
          <img id="previewFoto" alt="Vista previa de la imagen" style="display:none" />
        </div>
      </div>

      <div class="form__actions">
        <button class="btn" type="submit">Guardar producto</button>
        <button class="btn btn--ghost" type="reset">Limpiar</button>
        <button id="btnClearDB" class="btn btn--danger" type="button">
          Borrar catálogo (solo front)
        </button>
      </div>
    </form>

    <section aria-labelledby="tituloTabla" style="margin-top:1rem">
      <h2 id="tituloTabla" class="h2">Productos cargados</h2>
      <div class="table-wrapper">
        <table id="tablaProductos" class="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Envío</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>
  `;

  const form = document.getElementById('formAlta');
  const tbody = document.querySelector('#tablaProductos tbody');
  const btnClear = document.getElementById('btnClearDB');
  const inputFoto = document.getElementById('foto');
  const preview = document.getElementById('previewFoto');
  const edadDesde = document.getElementById('edadDesde');
  const edadHasta = document.getElementById('edadHasta');

  await cargarProductosAlta(tbody);

  if (inputFoto && preview) {
    const updatePreview = () => {
      const url = inputFoto.value.trim();
      if (!url) {
        preview.style.display = 'none';
        preview.removeAttribute('src');
        return;
      }
      preview.src = url;
      preview.style.display = 'block';
    };
    inputFoto.addEventListener('input', updatePreview);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const desde = edadDesde.value ? Number(edadDesde.value) : null;
    const hasta = edadHasta.value ? Number(edadHasta.value) : null;
    if (desde !== null && hasta !== null && desde > hasta) {
      window.alert('La edad hasta debe ser mayor o igual que la edad desde');
      edadHasta.focus();
      return;
    }

    const data = new FormData(form);
    const nuevo = {
      nombre: data.get('nombre').toString().trim(),
      precio: Number(data.get('precio')),
      stock: Number(data.get('stock')),
      marca: data.get('marca').toString().trim(),
      categoria: data.get('categoria').toString(),
      descCorta: data.get('descCorta').toString().trim(),
      descLarga: data.get('descLarga').toString().trim(),
      envio: data.get('envio') === 'on',
      edadDesde: desde,
      edadHasta: hasta,
      foto: data.get('foto').toString().trim()
    };

    try {
      const creado = await api.createProducto(nuevo);
      const normalizado = { ...creado, id: creado._id || creado.id };
      catalogoAlta.push(normalizado);
      renderTablaAlta(tbody);
      form.reset();
      if (preview) {
        preview.style.display = 'none';
        preview.removeAttribute('src');
      }
      window.alert('Producto guardado correctamente en la API.');
    } catch (err) {
      console.error('Error al crear producto:', err);
      window.alert('Error al guardar el producto.');
    }
  });

  btnClear.addEventListener('click', () => {
    if (window.confirm('Esto solo vacía la tabla en el front (no borra en la API). ¿Continuar?')) {
      catalogoAlta = [];
      renderTablaAlta(tbody);
    }
  });
}

// ===============
// VISTA CONTACTO
// ===============
function renderContacto () {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1 class="h1">Contacto</h1>

    <form id="formContacto" class="form" novalidate>
      <div class="form__row">
        <label for="cNombre">Nombre *</label>
        <input id="cNombre" name="nombre" type="text" required minlength="3" maxlength="60" />
      </div>

      <div class="form__row">
        <label for="cEmail">E-mail *</label>
        <input id="cEmail" name="email" type="email" required inputmode="email" />
      </div>

      <div class="form__row">
        <label for="cComentarios">Comentarios *</label>
        <textarea id="cComentarios" name="comentarios" required minlength="10" maxlength="800" rows="5"></textarea>
        <small class="hint">10–800 caracteres</small>
      </div>

      <div class="form__actions">
        <button class="btn" type="submit">Enviar</button>
        <button class="btn btn--ghost" type="reset">Limpiar</button>
      </div>
    </form>

    <p id="msgContacto" class="alert" role="status" aria-live="polite"></p>
  `;

  const form = document.getElementById('formContacto');
  const msg = document.getElementById('msgContacto');
  if (!form || !msg) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {};
    for (const [key, value] of new FormData(form).entries()) {
      data[key] = value;
    }

    if (data.nombre && data.email) {
      msg.textContent = `¡Gracias ${data.nombre}! Te responderemos a ${data.email} pronto.`;
    } else {
      msg.textContent = '¡Gracias! Te responderemos pronto.';
    }

    setTimeout(() => {
      msg.textContent = '';
    }, 5000);

    form.reset();
  });
}

// ===============
// VISTA NOSOTROS
// ===============
function renderNosotros () {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1 class="h1">Quiénes somos</h1>
    <p>
      En <strong>SuperMercado Nova</strong> creemos en un e-commerce simple, rápido y accesible.
      Esta web es parte de un proyecto académico del Bootcamp Full Stack y busca exhibir
      buenas prácticas de HTML, CSS y JavaScript sin frameworks.
    </p>

    <div class="feature-grid">
      <article class="feature">
        <h3>Calidad</h3>
        <p>Trabajamos con marcas líderes y control de stock.</p>
      </article>

      <article class="feature">
        <h3>Envíos</h3>
        <p>Opción de <em>envío sin cargo</em> en productos seleccionados.</p>
      </article>

      <article class="feature">
        <h3>Soporte</h3>
        <p>Atención al cliente y contacto directo desde el sitio.</p>
      </article>
    </div>
  `;
}

// ===============
// ROUTER SPA
// ===============
function setActiveNav (hash) {
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.getAttribute('href') === hash) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function router () {
  const hash = window.location.hash || '#/home';
  const route = hash.replace('#', '');

  setActiveNav(hash);

  switch (route) {
    case '/home':
      renderHome();
      break;
    case '/alta':
      renderAlta();
      break;
    case '/contacto':
      renderContacto();
      break;
    case '/nosotros':
      renderNosotros();
      break;
    default:
      renderHome();
  }
}

window.addEventListener('hashchange', router);

// ===============
// Eventos globales (carrito + router)
// ===============
window.addEventListener('DOMContentLoaded', () => {
  const btnCart = document.getElementById('cartButton');
  const overlay = document.getElementById('cartOverlay');
  const btnClose = document.getElementById('cartCloseBtn');
  const btnClear = document.getElementById('cartClearBtn');
  const btnConfirm = document.getElementById('cartConfirmBtn');

  // Abrir / cerrar carrito desde el botón del header
  if (btnCart && overlay) {
    btnCart.addEventListener('click', () => {
      if (overlay.classList.contains('hidden')) {
        abrirCarrito();
      } else {
        cerrarCarrito();
      }
    });
  }

  // Botón X dentro del modal
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      cerrarCarrito();
    });
  }

  // Click fuera del modal (en el overlay oscuro)
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        cerrarCarrito();
      }
    });
  }

  // Tecla ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      cerrarCarrito();
    }
  });

  // Vaciar carrito
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (!carrito.length) return;
      if (window.confirm('¿Vaciar carrito?')) {
        carrito = [];
        renderCarrito();
        actualizarBadgeCarrito();
      }
    });
  }

  // Confirmar pedido → backend /api/carrito
  if (btnConfirm) {
    btnConfirm.addEventListener('click', async () => {
      if (!carrito.length) {
        window.alert('Tu carrito está vacío.');
        return;
      }

      const pedido = {
        items: carrito.map(item => ({
          productoId: item.id,
          nombre: item.nombre,
          precioUnitario: Number(item.precio),
          cantidad: item.cantidad
        })),
        total: calcularTotalCarrito(),
        fecha: new Date().toISOString()
      };

      try {
        await api.enviarCarrito(pedido);
        // 2) Creamos el pago en MP (por ahora simulado)
        const pago = await api.crearPago(pedido);
        console.log('Respuesta de pago (MP / simulado):', pago);
        window.open(pago.init_point, '_blank');
        window.alert('Pedido enviado correctamente.');
        carrito = [];
        renderCarrito();
        actualizarBadgeCarrito();
        cerrarCarrito();
      } catch (err) {
        console.error('Error al enviar pedido:', err);
        window.alert('Error al enviar el pedido.');
      }
    });
  }

  // Arrancar SPA
  if (!window.location.hash) {
    window.location.hash = '#/home';
  }
  router();
});
