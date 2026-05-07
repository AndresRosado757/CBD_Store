/* ================================================================
   LÓGICA BOUTIQUE DE BIENESTAR CBD (productos desde JSON, imágenes)
   ================================================================ */

'use strict';

let PRODUCTOS = [];
let carrito = [];

const PRODUCTOS_JSON_PATH = document.currentScript
  ? new URL('../js/productos.json', document.currentScript.src).href
  : 'productos.json';
const STORAGE_KEY = 'carritoCBD';

const grid = document.getElementById('grid-productos');
const filtros = document.getElementById('filtros');
const listaUI = document.getElementById('list');
const totalUI = document.getElementById('total-importe');
const contadorUI = document.getElementById('contador-tareas');
const btnComprar = document.getElementById('btn-comprar');
const mensajeCompra = document.getElementById('mensaje-compra');
const abrirCarrito = document.getElementById('abrir-carrito');
const cerrarCarrito = document.getElementById('cerrar-carrito');
const carritoPanel = document.getElementById('carrito-panel');
const carritoOverlay = document.getElementById('carrito-overlay');

let USOS = ['Todos'];
let filtroActivo = 'Todos';

function iniciarTienda() {
  if (!grid) return;

  restaurarCarrito();

  fetch(PRODUCTOS_JSON_PATH)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar productos.json');
      return res.json();
    })
    .then(data => {
      PRODUCTOS = data;
      renderFiltros();
      cargarTienda();
      actualizarDOM();
    })
    .catch(error => {
      console.error(error);
      grid.innerHTML = '<p class="error-carga">No se pudieron cargar los productos. Recarga la página o prueba más tarde.</p>';
    });

  if (grid) {
    grid.addEventListener('click', function(e) {
      if (e.target.classList.contains('btn-aniadir-tienda')) {
        const id = Number(e.target.dataset.id);
        agregarProducto(id);
      }
    });
  }

  if (listaUI) {
    listaUI.addEventListener('click', function(e) {
      const id = Number(e.target.dataset.id);
      if (e.target.classList.contains('btn-restar')) quitarProducto(id);
      if (e.target.classList.contains('btn-sumar')) agregarProducto(id);
      if (e.target.classList.contains('btn-borrar')) borrarProducto(id);
    });
  }

  if (btnComprar) {
    btnComprar.addEventListener('click', function() {
      if (carrito.length === 0) {
        if (mensajeCompra) {
          mensajeCompra.textContent = 'El carrito está vacío.';
          mensajeCompra.style.color = 'var(--color-error)';
        }
        return;
      }
      if (mensajeCompra) {
        mensajeCompra.textContent = '¡Gracias por tu compra! Pronto recibirás tu pedido.';
        mensajeCompra.style.color = 'var(--color-principal)';
      }
      carrito = [];
      actualizarDOM();
      setTimeout(() => {
        if (mensajeCompra) mensajeCompra.textContent = '';
      }, 3000);
    });
  }

  if (abrirCarrito) {
    abrirCarrito.addEventListener('click', function() {
      abrirPanelCarrito();
    });
  }

  if (cerrarCarrito) cerrarCarrito.addEventListener('click', cerrarPanelCarrito);
  if (carritoOverlay) carritoOverlay.addEventListener('click', cerrarPanelCarrito);
}

document.addEventListener('DOMContentLoaded', iniciarTienda);

function renderFiltros() {
  if (!filtros) return;
  USOS = ['Todos', ...Array.from(new Set(PRODUCTOS.flatMap(p => p.uso.split(',').map(u => u.trim()))))];
  filtros.innerHTML = '';
  USOS.forEach(uso => {
    const btn = document.createElement('button');
    btn.className = 'filtro-btn' + (filtroActivo === uso ? ' activo' : '');
    btn.textContent = uso;
    btn.onclick = () => {
      filtroActivo = uso;
      renderFiltros();
      cargarTienda();
    };
    filtros.appendChild(btn);
  });
}

function cargarTienda() {
  if (!grid) return;
  grid.innerHTML = '';
  const productosFiltrados = filtroActivo === 'Todos'
    ? PRODUCTOS
    : PRODUCTOS.filter(p => p.uso.split(',').map(u => u.trim()).includes(filtroActivo));

  if (productosFiltrados.length === 0) {
    grid.innerHTML = '<p class="sin-productos">No hay productos para este filtro.</p>';
    return;
  }

  productosFiltrados.forEach(p => {
    const art = document.createElement('article');
    art.className = 'tarjeta-producto';
    art.setAttribute('role', 'listitem');
    art.innerHTML = `
      <img src="${p.imagen}" alt="Imagen de ${p.nombre}" loading="lazy">
      <span class="categoria">${p.categoria}</span>
      <h4>${p.nombre}</h4>
      <p class="precio">${p.precio.toFixed(2)}€</p>
      <p class="descripcion-prod">${p.descripcion}</p>
      <p class="beneficio">${p.beneficio}</p>
      <button class="btn-aniadir-tienda" data-id="${p.id}">Añadir al carrito</button>
    `;
    grid.appendChild(art);
  });
}

function agregarProducto(id) {
  const item = buscarProductoPorId(id);
  if (!item) return;
  const enCarrito = carrito.find(p => p.id === id);
  if (enCarrito) {
    enCarrito.unidades += 1;
  } else {
    carrito.push({ ...item, unidades: 1 });
  }
  actualizarDOM();
}

function quitarProducto(id) {
  const idx = carrito.findIndex(p => p.id === id);
  if (idx !== -1) {
    if (carrito[idx].unidades > 1) {
      carrito[idx].unidades -= 1;
    } else {
      carrito.splice(idx, 1);
    }
  }
  actualizarDOM();
}

function borrarProducto(id) {
  carrito = carrito.filter(p => p.id !== id);
  actualizarDOM();
}

function actualizarDOM() {
  if (!listaUI || !totalUI || !contadorUI) return;
  listaUI.innerHTML = '';
  let totalCaja = 0;

  carrito.forEach(prod => {
    const li = document.createElement('li');
    li.className = 'item-carrito';
    li.innerHTML = `
      <span>${prod.nombre}</span>
      <div class="controles">
        <button class="btn-restar" aria-label="Quitar una unidad" data-id="${prod.id}">-</button>
        <span class="unidades-num">${prod.unidades}</span>
        <button class="btn-sumar" aria-label="Añadir una unidad" data-id="${prod.id}">+</button>
        <button class="btn-borrar" aria-label="Eliminar del carrito" data-id="${prod.id}">x</button>
      </div>
    `;
    listaUI.appendChild(li);
    totalCaja += prod.precio * prod.unidades;
  });

  totalUI.textContent = totalCaja.toFixed(2) + '€';
  contadorUI.textContent = carrito.reduce((acc, p) => acc + p.unidades, 0);
  guardarCarrito();
}

function abrirPanelCarrito() {
  if (!carritoPanel || !carritoOverlay) return;
  carritoPanel.classList.add('activo');
  carritoPanel.classList.remove('oculto');
  carritoOverlay.classList.remove('oculto');
  carritoPanel.focus();
}

function cerrarPanelCarrito() {
  if (!carritoPanel || !carritoOverlay) return;
  carritoPanel.classList.remove('activo');
  setTimeout(() => carritoPanel.classList.add('oculto'), 300);
  carritoOverlay.classList.add('oculto');
}

window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') cerrarPanelCarrito();
});

function guardarCarrito() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  } catch (error) {
    console.warn('No se pudo guardar el carrito en localStorage.', error);
  }
}

function restaurarCarrito() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    carrito = JSON.parse(stored);
  } catch (error) {
    console.warn('No se pudo restaurar el carrito desde localStorage.', error);
    carrito = [];
  }
}

function buscarProductoPorId(id) {
  return PRODUCTOS.find(producto => producto.id === id) || null;
}

function obtenerProductosPorUso(uso) {
  if (uso === 'Todos') return PRODUCTOS;
  return PRODUCTOS.filter(p => p.uso.split(',').map(u => u.trim()).includes(uso));
}

window.addEventListener('beforeunload', guardarCarrito);

window.CBDStore = {
  iniciarTienda,
  buscarProductoPorId,
  obtenerProductosPorUso,
  agregarProducto,
  cargarTienda,
  guardarCarrito,
  restaurarCarrito,
};
