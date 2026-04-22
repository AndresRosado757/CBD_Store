/* ================================================================
   LÓGICA BOUTIQUE DE BIENESTAR CBD (productos desde JSON, imágenes)
   ================================================================ */

let PRODUCTOS = [];
let carrito = [];

// 1. SELECTORES
const grid = document.getElementById("grid-productos");
const filtros = document.getElementById("filtros");
const listaUI = document.getElementById("list");
const totalUI = document.getElementById("total-importe");
const contadorUI = document.getElementById("contador-tareas");
const btnComprar = document.getElementById("btn-comprar");
const mensajeCompra = document.getElementById("mensaje-compra");
const abrirCarrito = document.getElementById("abrir-carrito");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const carritoPanel = document.getElementById("carrito-panel");
const carritoOverlay = document.getElementById("carrito-overlay");

// 2. CARGA DE PRODUCTOS DESDE JSON
document.addEventListener('DOMContentLoaded', function() {
  // Solo ejecuta la tienda si existe el grid de productos
  if (document.getElementById('grid-productos')) {
    fetch('productos.json')
      .then(res => res.json())
      .then(data => {
        PRODUCTOS = data;
        renderFiltros();
        cargarTienda();
      });
  }
});

// 3. FILTROS POR USO
let USOS = ['Todos'];
let filtroActivo = 'Todos';
function renderFiltros() {
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

// 4. RENDERIZADO DE PRODUCTOS
function cargarTienda() {
    if (!grid) return;
    grid.innerHTML = "";
    let productosFiltrados = filtroActivo === 'Todos'
        ? PRODUCTOS
        : PRODUCTOS.filter(p => p.uso.split(',').map(u => u.trim()).includes(filtroActivo));
    productosFiltrados.forEach(p => {
        const art = document.createElement("article");
        art.className = "tarjeta-producto";
        art.setAttribute("role", "listitem");
        art.innerHTML = `
            <img src="${p.imagen}" alt="Imagen de ${p.nombre}">
            <span class="categoria">${p.categoria}</span>
            <h4>${p.nombre}</h4>
            <p class="precio">${p.precio.toFixed(2)}€</p>
            <p class="descripcion-prod">${p.descripcion}</p>
            <p class="beneficio">${p.beneficio}</p>
        `;
        grid.appendChild(art);
    });
}

// 5. LÓGICA DEL CARRITO
function agregarProducto(id) {
    const item = PRODUCTOS.find(p => p.id === id);
    const enCarrito = carrito.find(p => p.id === id);
    if (enCarrito) {
        enCarrito.unidades++;
    } else {
        carrito.push({ ...item, unidades: 1 });
    }
    actualizarDOM();
}
function quitarProducto(id) {
    const idx = carrito.findIndex(p => p.id === id);
    if (idx !== -1) {
        if (carrito[idx].unidades > 1) {
            carrito[idx].unidades--;
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
    listaUI.innerHTML = "";
    let totalCaja = 0;
    carrito.forEach(prod => {
        const li = document.createElement("li");
        li.className = "item-carrito";
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
    totalUI.textContent = totalCaja.toFixed(2) + "€";
    contadorUI.textContent = carrito.reduce((acc, p) => acc + p.unidades, 0);
}

// 6. EVENTOS
// Añadir producto
grid.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-aniadir-tienda")) {
        const id = Number(e.target.getAttribute("data-id"));
        agregarProducto(id);
    }
});
// Controles del carrito
listaUI.addEventListener("click", function(e) {
    const id = Number(e.target.getAttribute("data-id"));
    if (e.target.classList.contains("btn-restar")) quitarProducto(id);
    if (e.target.classList.contains("btn-sumar")) agregarProducto(id);
    if (e.target.classList.contains("btn-borrar")) borrarProducto(id);
});
// Comprar
btnComprar.addEventListener("click", function() {
    if (carrito.length === 0) {
        mensajeCompra.textContent = "El carrito está vacío.";
        mensajeCompra.style.color = "var(--color-error)";
        return;
    }
    mensajeCompra.textContent = "¡Gracias por tu compra! Pronto recibirás tu pedido.";
    mensajeCompra.style.color = "var(--color-principal)";
    carrito = [];
    actualizarDOM();
    setTimeout(() => mensajeCompra.textContent = "", 3000);
});
// Panel lateral carrito
abrirCarrito.addEventListener("click", function() {
    carritoPanel.classList.add("activo");
    carritoPanel.classList.remove("oculto");
    carritoOverlay.classList.remove("oculto");
    carritoPanel.focus();
});
cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
carritoOverlay.addEventListener("click", cerrarPanelCarrito);
function cerrarPanelCarrito() {
    carritoPanel.classList.remove("activo");
    setTimeout(()=>carritoPanel.classList.add("oculto"), 300);
    carritoOverlay.classList.add("oculto");
}
// Accesibilidad: cerrar panel con Escape
window.addEventListener("keydown", function(e) {
    if (e.key === "Escape") cerrarPanelCarrito();
});
