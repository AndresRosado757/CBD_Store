// ====================================
// INICIALIZACIÓN - Acceso a elementos del DOM
// ====================================

// Obtiene el botón del menú hamburguesa (☰) que aparece en dispositivos móviles
const btnMenu = document.getElementById('btn-menu');

// Obtiene la lista del menú principal que se mostrará/ocultará al hacer clic en el hamburguesa
const menuList = document.getElementById('menu-list');

// Obtiene el enlace de la categoría "Aceites" del submenu
const aceitesLink = document.getElementById('aceites');

// Obtiene el enlace de la categoría "Cremas Aliviadoras" del submenu
const cremasLink = document.getElementById('cremas');

// Obtiene el enlace de la categoría "Cosmética Natural" del submenu
const cosmeticaLink = document.getElementById('cosmetica');

// Obtiene el contenedor donde se mostrarán todas las tarjetas de productos
const productosContainer = document.getElementById('productos-container');

// ====================================
// CONFIGURACIÓN - Variables globales
// ====================================

// Ruta relativa al archivo JSON que contiene la base de datos de productos
const DB_PATH = 'json/almacen.json';

let almacen = [];

// ====================================
// FUNCIONALIDAD DEL MENÚ HAMBURGUESA
// ====================================

// Añade un listener al botón del menú hamburguesa
btnMenu.addEventListener('click', () => {
    // Toggle: si el menú tiene la clase 'mostrar', la elimina; si no la tiene, la añade
    // Esto permite mostrar/ocultar el menú en dispositivos móviles
    menuList.classList.toggle('mostrar');
});

// ====================================
// FUNCIÓN: Crear tarjeta de producto
// ====================================

/**
 * Esta función genera el HTML de una tarjeta de producto individual
 * @param {Object} producto - Objeto del producto con: nombre, descripcion, imagen, categoria
 * @returns {String} - HTML de la tarjeta de producto como template literal
 */
function crearTarjeta(producto) {
    // Convierte la categoría a formato CSS válido
    // Ejemplo: "cremas aliviadoras" -> "cremas-aliviadoras"
    const claseImagen = producto.categoria.replace(/\s+/g, '-').toLowerCase();
    
    // Obtiene la ruta de la imagen del producto (ej: images/aceite_cbd_relax.jpg")
    // Si no existe imagen, asigna una cadena vacía
    const rutaImagen = producto.imagen || '';
    
    // Crea una cadena de estilos CSS para usar como fondo de la imagen
    // Si existe imagen: aplica background-image con la ruta del JSON
    // Si no existe: deja vacío para que se use solo el color de fondo de la clase CSS
    const estiloFondo = rutaImagen ? `background-image: url('${rutaImagen}'); background-size: cover; background-position: center;` : '';
    
    // Retorna un template literal (HTML) con la estructura de una tarjeta de producto
    return `
        <article class="product-card">
            <div class="product-image ${claseImagen}" style="${estiloFondo}">
                ${!rutaImagen ? '<span>Sin imagen</span>' : ''}
            </div>
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <button class="btn-add">Añadir al carrito</button>
        </article>
    `;
}

// ====================================
// FUNCIÓN: Mostrar productos en la página
// ====================================

/**
 * Esta función renderiza (muestra) los productos en el contenedor
 * @param {Array} productos - Array de objetos de productos a mostrar
 */
function mostrarProductos(productos) {
    // Verifica que el contenedor existe antes de intentar modificarlo
    if (!productosContainer) return;

    // Si no hay productos en el array, muestra un mensaje de "sin resultados"
    if (productos.length === 0) {
        productosContainer.innerHTML = '<p class="no-products">No hay productos disponibles en esta categoría.</p>';
        return;
    }

    // Transforma cada producto en una tarjeta HTML usando map()
    // Luego las une todas con join('') para obtener un único string HTML
    productosContainer.innerHTML = productos.map(crearTarjeta).join('');
}

// ====================================
// FUNCIÓN: Filtrar productos por categoría
// ====================================

/**
 * Esta función filtra los productos por su categoría y los muestra
 * @param {String} categoria - Nombre de la categoría a filtrar (ej: "aceites", "cremas aliviadoras")
 */
function filtrarPorCategoria(categoria) {
    // Usa filter() para obtener solo los productos que coincidan con la categoría solicitada
    // filter() devuelve un nuevo array con los productos que cumplen la condición
    const productosFiltrados = almacen.filter(producto => producto.categoria === categoria);
    
    // Llama a mostrarProductos() para renderizar los productos filtrados en la página
    mostrarProductos(productosFiltrados);
}

// ====================================
// FUNCIÓN: Cargar datos del JSON
// ====================================

/**
 * Esta función carga el archivo JSON de productos desde el servidor
 * Usa fetch API (nativa del navegador) para realizar una petición HTTP
 */
function cargarAlmacen() {
    // fetch() realiza una petición GET al archivo JSON
    fetch(DB_PATH)
        // Primera promesa: convierte la respuesta a JSON
        .then(response => response.json())
        // Segunda promesa: recibe el array de productos parseado
        .then(data => {
            // Almacena el array de productos en la variable global 'almacen'
            almacen = data;
            
            // Muestra TODOS los productos al cargar la página por primera vez
            mostrarProductos(almacen);
        })
        // Manejo de errores: si algo falla en la carga del JSON
        .catch(error => console.error('Error al cargar almacen.json:', error));
}

// ====================================
// EVENT LISTENERS - Filtrado por categoría
// ====================================

// Cuando el usuario hace clic en "Aceites CBD" del submenu
aceitesLink.addEventListener('click', event => {
    // Previene el comportamiento por defecto del enlace (no navega a #)
    event.preventDefault();
    
    // Filtra y muestra solo los productos con categoría "aceites"
    filtrarPorCategoria('aceites');
});

// Cuando el usuario hace clic en "Cremas Aliviadoras" del submenu
cremasLink.addEventListener('click', event => {
    // Previene la navegación por defecto
    event.preventDefault();
    
    // Filtra y muestra solo los productos con categoría "cremas aliviadoras"
    filtrarPorCategoria('cremas aliviadoras');
});

// Cuando el usuario hace clic en "Cosmética Natural" del submenu
cosmeticaLink.addEventListener('click', event => {
    // Previene la navegación por defecto
    event.preventDefault();
    
    // Filtra y muestra solo los productos con categoría "cosmetica natural"
    filtrarPorCategoria('cosmetica natural');
});

// ====================================
// INICIALIZACIÓN - Carga inicial de datos
// ====================================

// Ejecuta la función de carga de JSON cuando la página se carga
// Esto muestra TODOS los productos en la página inicial
cargarAlmacen();
