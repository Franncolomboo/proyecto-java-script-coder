// main.js

// Variables globales para el manejo de filtros y estado
let productosBase = []; 
let productosFiltrados = []; 

// FUNCIÓN PRINCIPAL: Fetch y Filtrado
async function obtenerProductosPorCategoria(categoriaDeseada) {
    // Determinar la ruta correcta al JSON dinámicamente
    const isRoot = !window.location.pathname.includes('/pages/');
    const API_URL = isRoot ? './data/catalogo.json' : '../data/catalogo.json';
    
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

// NUEVA FUNCIÓN: Aplica filtros y ordenamiento a la lista de productos
function aplicarFiltrosYRenderizar() {
    let productosParaMostrar = [...productosBase]; 
    
    const contenedorId = productosBase.length > 0 && productosBase[0].categoria === 'Ofertas' 
                        ? 'contenedor-destacados' 
                        : productosBase.length > 0 && productosBase[0].categoria === 'Auriculares' && document.getElementById('contenedor-ofertas') 
                        ? 'contenedor-ofertas'
                        : 'productos-contenedor'; 

    // 1. OBTENER VALORES DE FILTRO Y ORDENAMIENTO
    const maxPriceInput = document.getElementById('rangoPrecio');
    const valorRangoSpan = document.getElementById('valorRango');
    const isEnvioGratisChecked = document.getElementById('envioGratis')?.checked;
    const ordenamiento = document.getElementById('ordenarPrecio')?.value;
    
    // Solo aplicar filtros si estamos en una página de catálogo
    if (document.body.getAttribute('data-categoria')) {
        
        if (maxPriceInput && valorRangoSpan) {
            const maxPrice = parseInt(maxPriceInput.value);
            valorRangoSpan.textContent = maxPrice.toLocaleString('es-ES');
            
            // FILTRO POR PRECIO MÁXIMO
            productosParaMostrar = productosParaMostrar.filter(producto => {
                const precioAComparar = producto.precio_oferta || producto.precio || 0;
                return precioAComparar <= maxPrice;
            });
        }

        // FILTRO POR ENVÍO GRATIS
        if (isEnvioGratisChecked) {
            productosParaMostrar = productosParaMostrar.filter(producto => producto['envio-gratis'] === true);
        }
        
        // ORDENAMIENTO POR PRECIO
        if (ordenamiento && ordenamiento !== 'default') {
            const factor = (ordenamiento === 'minMax') ? 1 : -1; 
            
            productosParaMostrar.sort((a, b) => {
                const precioA = a.precio_oferta || a.precio || 0;
                const precioB = b.precio_oferta || b.precio || 0;
                
                return (precioA - precioB) * factor; 
            });
        }
    }

    // RENDERIZAR RESULTADO
    productosFiltrados = productosParaMostrar;
    renderizarProductos(productosFiltrados, contenedorId);
}

function renderizarProductos(productos, elementoContenedorId) {
    const contenedor = document.getElementById(elementoContenedorId);
    if (!contenedor) return;
    
    // Mostrar mensaje si no hay productos
    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="alert alert-warning">No se encontraron productos con los filtros aplicados.</p>';
        return;
    }

    contenedor.innerHTML = productos.map(producto => {
        // CORRECCIÓN PARA EL PRECIO: Si es null, muestra 'Consultar precio'
        const precioNormal = producto.precio !== null ? producto.precio.toLocaleString('es-ES') : 'Consultar precio';  
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
                     <p class="nuevo-precio">${precioNormal.includes('Consultar') ? precioNormal : '$' + precioNormal}</p>
                 </div>
                 `;
        
        // Etiqueta de Envío Gratis 
        const envioGratisHTML = producto['envio-gratis']
             ? `<div class="envio-gratis"> Envío GRATIS🚀</div>`
             : ''; 

        // Retorna la estructura HTML completa
        return `
            <div class="card-jbl">
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='../assets/img/default-placeholder.jpg';">
                ${envioGratisHTML}
                <div class="body-card">
                    <div>
                    <h5>${producto.nombre}</h5>
                    <p>${producto.descripcion}</p>
                    </div>
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
    // 1. Obtener los productos filtrados por la categoría y guardarlos en productosBase
    productosBase = await obtenerProductosPorCategoria(categoria);

    // 2. Renderizar la primera vez con filtros por defecto
    aplicarFiltrosYRenderizar(); 
    
    // 3. Configurar Eventos para Filtro y Ordenamiento (Solo si estamos en una página de catálogo)
    if (document.body.getAttribute('data-categoria')) {
        const rangoPrecio = document.getElementById('rangoPrecio');
        const ordenarPrecio = document.getElementById('ordenarPrecio');
        const envioGratis = document.getElementById('envioGratis');
        const btnReiniciarFiltros = document.getElementById('btnReiniciarFiltros');
        
        if (rangoPrecio) rangoPrecio.addEventListener('input', aplicarFiltrosYRenderizar);
        if (envioGratis) envioGratis.addEventListener('change', aplicarFiltrosYRenderizar);
        if (ordenarPrecio) ordenarPrecio.addEventListener('change', aplicarFiltrosYRenderizar);

        if (btnReiniciarFiltros) {
            btnReiniciarFiltros.addEventListener('click', () => {
                if (ordenarPrecio) ordenarPrecio.value = 'default';
                if (envioGratis) envioGratis.checked = false;
                if (rangoPrecio) rangoPrecio.value = rangoPrecio.max; 
                
                aplicarFiltrosYRenderizar();
            });
        }
    }
}


const ID_CONTENEDOR_DESTACADOS = 'contenedor-destacados';
const ID_CONTENEDOR_AURICULARES = 'contenedor-ofertas';

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el INDEX.HTML (que necesita cargar múltiples categorías)

    const contenedorDestacados = document.getElementById(ID_CONTENEDOR_DESTACADOS);
    const contenedorAuriculares = document.getElementById(ID_CONTENEDOR_AURICULARES);

    if (contenedorDestacados && contenedorAuriculares) {
        // Estamos en el index.html: Inicia la carga de las dos secciones
        inicializarPagina('Ofertas', ID_CONTENEDOR_DESTACADOS); 
        inicializarPagina('Auriculares', ID_CONTENEDOR_AURICULARES);
        
    } else {
        // Lógica para las páginas de categorías únicas
        const categoriaUnica = document.body.getAttribute('data-categoria');
        const contenedorUnicoId = 'productos-contenedor'; 

        if (categoriaUnica && document.getElementById(contenedorUnicoId)) {
            console.log(`Cargando productos para la categoría: ${categoriaUnica}`);
            inicializarPagina(categoriaUnica, contenedorUnicoId);
        }
    }
});