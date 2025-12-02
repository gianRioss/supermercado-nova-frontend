/* eslint-env browser */
/* eslint-disable space-before-function-paren, keyword-spacing */

// Utilidad: obtener / guardar catálogo en localStorage
const STORAGE_KEY = 'catalogoNova';

// getCatalogo()
// Lee el catálogo de productos desde localStorage. Si no hay nada guardado, devuelve un array vacío.
function getCatalogo () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('No se pudo leer localStorage', e);
    return [];
  }
}

// setCatalogo(items)
// Guarda el array de productos (items) en localStorage bajo la clave definida.
function setCatalogo(items) {
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }catch(e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}

// uid()
// Genera un identificador único para cada producto. Usa crypto.randomUUID si está disponible, si no, usa un método alternativo.
function uid() {
  try{
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
  }catch(_) {}
  // Fallback RFC4122-ish (no criptográfico)
  function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1); }
  return (
    Date.now().toString(16) + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  );
}

// CATALOGO_BASE (con imágenes locales en /public)
const CATALOGO_BASE = [
  { id: uid(), nombre: 'Leche Entera 1L', precio: 1799.99, stock: 30, marca: 'La Serenísima', categoria: 'Lácteos', descCorta: 'Leche entera larga vida.', descLarga: 'Leche entera UAT 1 litro. Libre de gluten. Conservación a temperatura ambiente, una vez abierta refrigerar y consumir en 3 días.', envio: false, foto: 'public/leche.png' },
  { id: uid(), nombre: 'Detergente Limón 750ml', precio: 1490, stock: 45, marca: 'Ala', categoria: 'Limpieza', descCorta: 'Detergente concentrado.', descLarga: 'Detergente con poder desengrasante y aroma a limón. Rendidor y económico.', envio: true, foto: 'public/cif.png' },
  { id: uid(), nombre: 'Yerba Mate 1Kg', precio: 4890, stock: 20, marca: 'Taragüi', categoria: 'Almacén', descCorta: 'Sabor intenso y parejo.', descLarga: 'Yerba mate con palo estacionada naturalmente. Ideal para mates de sabor clásico.', envio: false, foto: 'public/yerba.jpg' }
];

// boot()
// Si el catálogo está vacío, lo inicializa con CATALOGO_BASE. Luego llama a las funciones de inicialización de cada página.
(function boot() {
  // Si no hay catálogo, cargar demo
  const actual = getCatalogo();
  if(!actual || actual.length === 0) {
    setCatalogo(CATALOGO_BASE);
  }

  // Inicializar páginas según elementos presentes
  initHome();
  initAlta();
  initContacto();
})();

// ===== Home (index.html) =====
function initHome() {
  const grid = document.getElementById('cards');
  if(!grid) return; // no estamos en index

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');

  function render(lista) {
    grid.setAttribute('aria-busy', 'true');
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card__media">
          <img src="${p.foto}" alt="${p.nombre}" loading="lazy"/>
        </div>
        <div class="card__body">
          <h3 class="card__title">${p.nombre}</h3>
          <div class="card__price">$ ${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p class="card__desc">${p.descCorta}</p>
          <div class="card__tags">
            <span class="tag">${p.marca}</span>
            <span class="tag">${p.categoria}</span>
            ${p.envio ? '<span class="tag">Envío sin cargo</span>' : ''}
          </div>
        </div>
        <div class="card__actions">
          <button class="btn" type="button" aria-label="Comprar ${p.nombre}">Comprar</button>
          <button class="btn btn--ghost" type="button" aria-label="Ver más de ${p.nombre}">Ver más</button>
        </div>
      `;
      frag.appendChild(card);
    });

    grid.appendChild(frag);
    grid.setAttribute('aria-busy', 'false');
  }

  const catalogo = getCatalogo();
  render(catalogo);

  if(form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim().toLowerCase();
      const filtrada = getCatalogo().filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      );
      render(filtrada);
    });
  }
}

// ===== Alta (alta.html) =====
function initAlta() {
  const form = document.getElementById('formAlta');
  const tabla = document.getElementById('tablaProductos');
  const btnClear = document.getElementById('btnClearDB');

  if(!form || !tabla) return; // no estamos en alta

  // Vista previa de la imagen (migrada desde alta.html)
  const inputFoto = document.getElementById('foto');
  const preview = document.getElementById('previewFoto');
  if (inputFoto && preview) {
    const updatePreview = () => {
      const url = inputFoto.value.trim();
      if (!url) { preview.style.display = 'none'; preview.removeAttribute('src'); return; }
      preview.src = url;
      preview.style.display = 'block';
    };
    inputFoto.addEventListener('input', updatePreview);
  }

  function filaHTML(p) {
    return `
      <tr>
        <td><img src="${p.foto}" alt="${p.nombre}"></td>
        <td>${p.nombre}</td>
        <td>$ ${Number(p.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        <td>${p.stock}</td>
        <td>${p.marca}</td>
        <td>${p.categoria}</td>
        <td>${p.envio ? 'Sí' : 'No'}</td>
        <td><button class="btn btn--ghost" data-id="${p.id}">Eliminar</button></td>
      </tr>
    `;
  }

  function renderTabla() {
    const tbody = tabla.querySelector('tbody');
    const lista = getCatalogo();
    tbody.innerHTML = lista.map(filaHTML).join('');
  }

  renderTabla();

  // Validación HTML + guardado
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const nuevo = {
      id: uid(),
      nombre: data.get('nombre').toString().trim(),
      precio: Number(data.get('precio')),
      stock: Number(data.get('stock')),
      marca: data.get('marca').toString().trim(),
      categoria: data.get('categoria').toString(),
      descCorta: data.get('descCorta').toString().trim(),
      descLarga: data.get('descLarga').toString().trim(),
      envio: !!data.get('envio'),
      foto: data.get('foto').toString().trim()
    };
    const lista = getCatalogo();
    lista.push(nuevo);
    setCatalogo(lista);
    renderTabla();
    form.reset();
    // oculto la preview si estaba visible
    if (preview) { preview.style.display = 'none'; preview.removeAttribute('src'); }
  });

  // Eliminar producto (delegación)
  tabla.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    const lista = getCatalogo().filter(p => p.id !== id);
    setCatalogo(lista);
    renderTabla();
  });

  // Borrar catálogo
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if(confirm('¿Seguro que querés borrar todos los productos?')) {
        setCatalogo([]);
        renderTabla();
      }
    });
  }
}

// ===== Contacto (contacto.html) =====
function initContacto() {
  const form = document.getElementById('formContacto');
  const msg = document.getElementById('msgContacto');
  if(!form || !msg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // Compatibilidad: convertir FormData a objeto manualmente
    const data = {};
    for (const [key, value] of new FormData(form).entries()) {
      data[key] = value;
    }
    // Validar que msg existe antes de modificarlo
    if (msg) {
      if (data.nombre && data.email) {
        msg.textContent = `¡Gracias ${data.nombre}! Te responderemos a ${data.email} pronto.`;
      } else {
        msg.textContent = '¡Gracias! Te responderemos pronto.';
      }
      setTimeout(() => {
        if (msg) msg.textContent = '';
      }, 5000);
    }
    form.reset();
  });
}
