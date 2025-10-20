// main.js

const API_URL = '../data/catalogo.json'; 

// FUNCIÓN PRINCIPAL: Fetch y Filtrado
    
async function obtenerProductosPorCategoria(categoriaDeseada) {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Filtra el array de productos por la categoría deseada
        return data.productos.filter(producto => 
            producto.categoria === categoriaDeseada
        );

    } catch (error) {
        console.error("Hubo un error al obtener o procesar los productos:", error);
        return [];
    }
}


function renderizarProductos(productos, elementoContenedorId) {
    const contenedor = document.getElementById(elementoContenedorId);
    if (!contenedor) return;

    contenedor.innerHTML = productos.map(producto => {
        // Formateo de precios (usando 'es-ES' como ejemplo)
        const precioNormal = producto.precio.toLocaleString('es-ES');
        const precioOferta = producto.precio_oferta ? producto.precio_oferta.toLocaleString('es-ES') : null;
        
        // Contenido de los precios y la oferta
        const preciosHTML = producto.oferta && producto.precio_oferta !== null
            ? `
                <div class="precios">
                    <p class="precio-anterior">$${precioNormal}</p>
                    <p class="nuevo-precio">$${precioOferta}</p>
                </div>
                `
            : `
                <div class="precios">
                    <p class="nuevo-precio">$${precioNormal}</p>
                </div>
                `;
        // Etiqueta de Envío Gratis 
        const envioGratisHTML = producto['envio-gratis']
            ? `<div class="envio-gratis">🚀 Envío GRATIS</div>`
            : ''; // Si es false , no muestra nada

        // Retorna la estructura HTML completa
        return `
            <div class="card-jbl">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                ${envioGratisHTML}
                <div class="body-card">
                    <span class="categoria">${producto.categoria}</span>
                    <h5>${producto.nombre}</h5>
                    <p>${producto.descripcion}</p>
                    ${preciosHTML}
                    <button class="boton-card">Agregar</button>
                </div>
            </div>
        `;
    }).join('');
}
/**
 * Función que carga y muestra productos de una categoría específica en un contenedor.
 * @param {string} categoria - La categoría a filtrar (ej: 'Auriculares', 'Parlantes', 'Ofertas').
 * @param {string} contenedorId - El ID del elemento HTML donde se muestran los productos.
 */
async function inicializarPagina(categoria, contenedorId) {
    // 1. Obtener los productos filtrados por la categoría
    const productosFiltrados = await obtenerProductosPorCategoria(categoria);

    // 2. Renderizar los productos en el contenedor
    renderizarProductos(productosFiltrados, contenedorId);
}


const ID_CONTENEDOR_DESTACADOS = 'contenedor-destacados';
const ID_CONTENEDOR_AURICULARES = 'contenedor-ofertas';

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el INDEX.HTML (que necesita cargar múltiples categorías)
    // ---------------------------------------------------------------------

    const contenedorDestacados = document.getElementById(ID_CONTENEDOR_DESTACADOS);
    const contenedorAuriculares = document.getElementById(ID_CONTENEDOR_AURICULARES);

    if (contenedorDestacados && contenedorAuriculares) {
        // Estamos en el index.html (o una página que necesita ambas secciones)
        
        // Cargar la primera sección: Destacados/Ofertas
        inicializarPagina('Ofertas', ID_CONTENEDOR_DESTACADOS); 
        
        // Cargar la segunda sección: Auriculares
        inicializarPagina('Auriculares', ID_CONTENEDOR_AURICULARES);
        
    } else {
        // Lógica para las páginas de categorías únicas (Auriculares.html, Parlantes.html, etc.)
        // ------------------------------------------------------------------------------------
        
        // Se mantiene la lógica del atributo data-categoria para las páginas de catálogo
        const categoriaUnica = document.body.getAttribute('data-categoria');
        const contenedorUnicoId = 'productos-contenedor'; // Asume que este es el ID en tus otras páginas

        if (categoriaUnica && document.getElementById(contenedorUnicoId)) {
            console.log(`Cargando productos para la categoría: ${categoriaUnica}`);
            inicializarPagina(categoriaUnica, contenedorUnicoId);
        }
    }
});