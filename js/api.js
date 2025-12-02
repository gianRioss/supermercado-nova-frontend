// js/api.js

// Apunta a tu backend en Render (producción)
const BASE_URL = 'https://supermercado-nova-backend.onrender.com/api';

async function handleResponse (res, msgError) {
  if (!res.ok) {
    let detalle = '';
    try {
      const data = await res.json();
      detalle = data.error || data.message || JSON.stringify(data);
    } catch (_) {
      // ignoramos errores al parsear
    }
    throw new Error(msgError + (detalle ? ` → ${detalle}` : ''));
  }

  // Si hay contenido JSON, lo devolvemos; si no, devolvemos null
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const api = {
  async crearPago (pedido) {
    const res = await fetch(`${BASE_URL}/pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });
    return handleResponse(res, 'Error al crear el pago');
  },

  async getProductos () {
    const res = await fetch(`${BASE_URL}/productos`);
    return handleResponse(res, 'Error al obtener productos');
  },

  async createProducto (data) {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res, 'Error al crear producto');
  },

  async updateProducto (id, data) {
    const res = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res, 'Error al actualizar producto');
  },

  async deleteProducto (id) {
    const res = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Error al eliminar producto');
    }
    // 204 sin body → devolvemos true
    return true;
  },

  // =============
  // PAGO (Mercado Pago)
  // ============

  async enviarCarrito (pedido) {
    // 'pedido' es un objeto con { items, total, fecha }
    const res = await fetch(`${BASE_URL}/carrito`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });

    return handleResponse(res, 'Error al enviar el carrito');
  }
};
