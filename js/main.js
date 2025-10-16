// main.js

const API_URL = './productos.json'; // Asegúrate de que esta ruta sea correcta

// ===========================================
// FUNCIÓN PRINCIPAL: Fetch y Filtrado
// ===========================================
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

// ===========================================
// FUNCIÓN DE RENDERIZADO (Adaptada a tu HTML)
// ===========================================
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
              
        // Etiqueta de Envío Gratis (Solo se renderiza si es true)
        const envioGratisHTML = producto['envio-gratis']
            ? `<div class="envio-gratis">🚀 Envío GRATIS</div>`
            : ''; // Si es false, no se renderiza nada.

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