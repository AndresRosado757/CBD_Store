// 1. Accedemos a los nodos del DOM por su ID
const btnMenu = document.getElementById('btn-menu');
const menuList = document.getElementById('menu-list');

// 2. Añadimos un escuchador de eventos (listener) al botón
btnMenu.addEventListener('click', () => {
    // 3. Alternamos la clase 'mostrar'. Si la tiene, se la quita; si no la tiene, se la pone.
    menuList.classList.toggle('mostrar');
});