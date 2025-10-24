/**
 * Inicialización de Variables Globales
 * Almacenamos el catálogo, los productos base para filtros,
 * y la clave de localStorage para el carrito.
 */
let catalogoCompleto = [];
let productosBase = [];
let productosFiltrados = [];

const CARRITO_STORAGE_KEY = 'jblCarrito';

// ----------------------------------------------------
// LÓGICA DE DATOS Y STORAGE
// ----------------------------------------------------

function obtenerProductoData(id) {
    // Buscamos un producto por ID dentro del catálogo completo.
    const idNumerico = parseInt(id);
    return catalogoCompleto.find(p => p.id === idNumerico) || null;
}

function obtenerCarrito() {
    // Recupera el carrito del localStorage. Si no existe, devuelve un array vacío.
    const carritoJSON = localStorage.getItem(CARRITO_STORAGE_KEY);
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function guardarCarrito(carrito) {
    // Guarda el estado actual del carrito en localStorage y actualiza el contador del ícono.
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// ----------------------------------------------------
// NOTIFICACIONES (Toastify)
// ----------------------------------------------------

function mostrarToast(mensaje) {
    // Muestra un Toastify para notificar al usuario que el producto fue agregado.
    // Incluye lógica de redirección al carrito al hacer clic.
    if (typeof Toastify === 'undefined') return;
    
    Toastify({
        text: "✅ " + mensaje,
        duration: 1800,
        onClick: function(){ 
            // Determina la ruta correcta a Carrito.html (ajusta según la ubicación actual).
            const isRoot = !window.location.pathname.includes('/pages/');
            const carritoUrl = isRoot ? './pages/Carrito.html' : './Carrito.html';
            window.location.href = carritoUrl; 
        } 
    }).showToast();
}

function mostrarToastExito(mensaje) {
    // Muestra un Toastify con un estilo y posición central diferente
    // para indicar la finalización exitosa de la compra.
    if (typeof Toastify === 'undefined') return;

    Toastify({
        text: "🎉 " + mensaje,
        duration: 4000,
        gravity: "bottom", 
        position: "center", 
        // Estilo de fondo distinto para la notificación de éxito.
        style: {
            background: "linear-gradient(to right, #007bff, #17a2b8)", 
        }
    }).showToast();
}

// ----------------------------------------------------
// LÓGICA DE COMPRA Y REDIRECCIÓN
// ----------------------------------------------------

function simularFinalizarCompra() {
    // Simula el proceso de compra con pausas (setTimeout) para dar una experiencia de usuario más tranquila.
    mostrarToastExito("¡Compra realizada con éxito! Procesando pedido...");

    // Pausa inicial de 1.5 segundos.
    setTimeout(() => {
        // Vacía el carrito del localStorage.
        localStorage.removeItem(CARRITO_STORAGE_KEY);
        
        // Refresca la vista del carrito y el contador.
        if (document.getElementById('carrito-items-contenedor')) {
            renderizarCarritoView(); 
        }
        actualizarContadorCarrito();    

        // Segunda pausa de 2 segundos antes de redirigir al inicio.
        setTimeout(() => {
            window.location.href = '../index.html'; 
        }, 2000); 

    }, 1500); 
}

// ----------------------------------------------------
// GESTIÓN DEL CARRITO
// ----------------------------------------------------

function actualizarContadorCarrito() {
    // Calcula el número total de ítems en el carrito y actualiza el valor del span en el header.
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const contadorDesktop = document.getElementById('contador-carrito');
    const contadorMovil = document.getElementById('contador-carrito-movil'); 

    if (contadorDesktop) {
        contadorDesktop.textContent = totalItems;
        // Oculta/muestra el contador si el total es cero.
        contadorDesktop.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    // Lógica similar para el contador móvil, si existe.
    if (contadorMovil) {
        contadorMovil.textContent = totalItems;
        contadorMovil.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

function agregarAlCarrito(productoData) {
    // Busca si el producto ya existe. Si existe, aumenta la cantidad; si no, lo añade.
    const carrito = obtenerCarrito();
    const productoExistente = carrito.find(item => item.id === productoData.id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        const precioUnitario = productoData.precio_oferta || productoData.precio || 0;

        carrito.push({
            id: productoData.id,
            nombre: productoData.nombre,
            imagen: productoData.imagen,
            precio: precioUnitario,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    // Si estamos en la página del carrito, la refrescamos.
    if (document.getElementById('carrito-items-contenedor')) {
        renderizarCarritoView();
    }

    mostrarToast(productoData.nombre + ' agregado al carrito');
}

function decrementarCantidad(id) {
    // Reduce la cantidad de un producto. Si llega a 1, lo elimina del carrito.
    let carrito = obtenerCarrito();
    const idNumerico = parseInt(id);
    const index = carrito.findIndex(item => item.id === idNumerico);

    if (index !== -1) {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
        } else {
            carrito.splice(index, 1); // Elimina el ítem si la cantidad es 1.
        }
    }

    guardarCarrito(carrito);
}

function eliminarProducto(id) {
    // Elimina completamente un producto del carrito.
    let carrito = obtenerCarrito();
    const idNumerico = parseInt(id);
    carrito = carrito.filter(item => item.id !== idNumerico);
    guardarCarrito(carrito);
}

// ----------------------------------------------------
// CARGA DE DATOS DEL CATÁLOGO
// ----------------------------------------------------

async function obtenerDataCatalogo() {
    // Carga el catálogo desde el JSON. Utiliza la variable global para evitar recargar.
    if (catalogoCompleto.length > 0) return catalogoCompleto;

    // Ajusta la ruta del JSON dependiendo de si estamos en la raíz o en una subpágina (/pages).
    const isRoot = !window.location.pathname.includes('/pages/');
    const API_URL = isRoot ? './data/catalogo.json' : '../data/catalogo.json';

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP o Archivo no encontrado. Status: ${response.status}. Ruta intentada: ${API_URL}`);
        }

        const data = await response.json();
        catalogoCompleto = data.productos;

        return catalogoCompleto;

    } catch (error) {
        console.error("Hubo un error al obtener o procesar el catálogo:", error);
        return [];
    }
}

async function obtenerProductosPorCategoria(categoriaDeseada) {
    // Filtra el catálogo cargado por la categoría deseada.
    const catalogo = await obtenerDataCatalogo();
    return catalogo.filter(producto =>
        producto.categoria === categoriaDeseada
    );
}

// ----------------------------------------------------
// FILTROS Y RENDERIZADO EN PÁGINAS DE CATEGORÍA
// ----------------------------------------------------

function aplicarFiltrosYRenderizar(contenedorId) {
    // Aplica los filtros de precio, envío gratis y ordenamiento antes de renderizar.
    let productosParaMostrar = [...productosBase];

    const maxPriceInput = document.getElementById('rangoPrecio');
    const valorRangoSpan = document.getElementById('valorRango');
    const isEnvioGratisChecked = document.getElementById('envioGratis')?.checked;
    const ordenamiento = document.getElementById('ordenarPrecio')?.value;

    if (document.body.getAttribute('data-categoria')) {

        if (maxPriceInput && valorRangoSpan) {
            const maxPrice = parseInt(maxPriceInput.value);
            // Filtra productos por rango de precio.
            productosParaMostrar = productosParaMostrar.filter(producto => {
                const precioAComparar = producto.precio_oferta || producto.precio || 0;
                return precioAComparar <= maxPrice;
            });
        }

        if (isEnvioGratisChecked) {
            // Filtra productos por envío gratis.
            productosParaMostrar = productosParaMostrar.filter(producto => producto['envio-gratis'] === true);
        }

        if (ordenamiento && ordenamiento !== 'default') {
            const factor = (ordenamiento === 'minMax') ? 1 : -1;
            // Ordena productos por precio (ascendente o descendente).
            productosParaMostrar.sort((a, b) => {
                const precioA = a.precio_oferta || a.precio || 0;
                const precioB = b.precio_oferta || b.precio || 0;

                return (precioA - precioB) * factor;
            });
        }
    }

    productosFiltrados = productosParaMostrar;
    renderizarProductos(productosFiltrados, contenedorId);
}

function renderizarProductos(productos, elementoContenedorId) {
    // Genera el HTML de las tarjetas de producto y lo inserta en el contenedor.
    const contenedor = document.getElementById(elementoContenedorId);
    if (!contenedor) return;

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="alert alert-warning">No se encontraron productos con los filtros aplicados.</p>';
        return;
    }

    contenedor.innerHTML = productos.map(producto => {
        // Lógica compleja para mostrar precios (oferta vs. normal) y el tag de envío gratis.
        const precioNormal = producto.precio !== null ? producto.precio.toLocaleString('es-ES') : 'Consultar precio';
        const precioOferta = producto.precio_oferta ? producto.precio_oferta.toLocaleString('es-ES') : null;

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

        const envioGratisHTML = producto['envio-gratis']
             ? `<div class="envio-gratis"> Envío GRATIS🚀</div>`
             : '';

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
                    <button class="boton-card" data-id="${producto.id}">Agregar</button>
                </div>
            </div>
        `;
    }).join('');

    const botonesAgregar = contenedor.querySelectorAll('.boton-card');

    if (botonesAgregar.length === 0) return;

    // Adjunta el evento de 'agregarAlCarrito' a cada botón generado dinámicamente.
    botonesAgregar.forEach(button => {
        button.addEventListener('click', (e) => {
            const productoId = e.currentTarget.getAttribute('data-id');
            const productoData = obtenerProductoData(productoId);

            if (productoData) {
                agregarAlCarrito(productoData);
            } else {
                console.error("ERROR CRÍTICO: Producto con ID:", productoId, "no encontrado en el catálogo.");
            }
        });
    });
}

async function inicializarPagina(categoria, contenedorId) {
    // Carga los productos base para una categoría y establece los listeners de los filtros.
    productosBase = await obtenerProductosPorCategoria(categoria);
    aplicarFiltrosYRenderizar(contenedorId);

    if (document.body.getAttribute('data-categoria')) {
        const rangoPrecio = document.getElementById('rangoPrecio');
        const ordenarPrecio = document.getElementById('ordenarPrecio');
        const envioGratis = document.getElementById('envioGratis');
        const btnReiniciarFiltros = document.getElementById('btnReiniciarFiltros');

        // Escuchas para actualizar los filtros en tiempo real (input/change).
        if (rangoPrecio) rangoPrecio.addEventListener('input', () => aplicarFiltrosYRenderizar(contenedorId));
        if (envioGratis) envioGratis.addEventListener('change', () => aplicarFiltrosYRenderizar(contenedorId));
        if (ordenarPrecio) ordenarPrecio.addEventListener('change', () => aplicarFiltrosYRenderizar(contenedorId));

        if (btnReiniciarFiltros) {
            btnReiniciarFiltros.addEventListener('click', () => {
                // Lógica para restablecer todos los valores de los filtros a su estado inicial.
                if (ordenarPrecio) ordenarPrecio.value = 'default';
                if (envioGratis) envioGratis.checked = false;
                if (rangoPrecio) rangoPrecio.value = rangoPrecio.max;

                aplicarFiltrosYRenderizar(contenedorId);
            });
        }
    }
}

// ----------------------------------------------------
// LÓGICA DE CUPONES Y RESUMEN DEL CARRITO
// ----------------------------------------------------

function manejarCupones() {
    // Escucha el botón de "Aplicar Cupón" y guarda el cupón 'JBL20' en localStorage.
    const aplicarCuponBtn = document.getElementById('aplicarCuponBtn');
    const cuponInput = document.getElementById('cuponInput');
    const cuponMensaje = document.getElementById('cupon-mensaje');

    if (aplicarCuponBtn) {
        aplicarCuponBtn.addEventListener('click', () => {
            const codigo = cuponInput.value.trim().toUpperCase();

            if (codigo === 'JBL20') {
                localStorage.setItem('cuponAplicado', codigo);
                cuponMensaje.textContent = 'Cupón JBL20 aplicado con éxito (20% OFF).';
                cuponMensaje.classList.remove('text-muted', 'text-danger');
                cuponMensaje.classList.add('text-success');
            } else {
                localStorage.removeItem('cuponAplicado');
                cuponMensaje.textContent = 'Cupón inválido o expirado.';
                cuponMensaje.classList.remove('text-muted', 'text-success');
                cuponMensaje.classList.add('text-danger');
            }
            renderizarCarritoView(); // Obliga al resumen a recalcularse con el nuevo cupón.
        });
    }
}

function actualizarResumenCarrito(carrito, subtotal) {
    // Calcula el descuento del cupón (solo 'JBL20' al 20%) y el total final.
    const cuponAplicado = localStorage.getItem('cuponAplicado');
    let descuento = 0;
    let descuentoPorcentaje = 0;

    if (cuponAplicado === 'JBL20') {
        descuentoPorcentaje = 20;
        descuento = subtotal * 0.20;
    }

    const totalFinal = subtotal - descuento;

    // Actualiza los elementos del DOM con los totales formateados.
    document.getElementById('total-subtotal').textContent = subtotal.toLocaleString('es-ES');
    document.getElementById('total-descuento').textContent = descuento.toLocaleString('es-ES');
    document.getElementById('total-final').textContent = totalFinal.toLocaleString('es-ES');

    const descuentoPorcentajeSpan = document.getElementById('descuento-porcentaje');
    if (descuentoPorcentajeSpan) {
        descuentoPorcentajeSpan.textContent = `${descuentoPorcentaje}%`;
    }
}

function adjuntarEventosCarritoView(contenedor) {
    // Adjunta los listeners a los botones de aumentar, decrementar y eliminar fila completa.
    contenedor.querySelectorAll('.btn-aumentar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const productoData = obtenerProductoData(id);
            if (productoData) {
                agregarAlCarrito(productoData); // Reutiliza agregarAlCarrito para aumentar.
            }
        });
    });

    contenedor.querySelectorAll('.btn-decrementar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            decrementarCantidad(id);
            renderizarCarritoView(); // Vuelve a renderizar para reflejar el cambio o la eliminación.
        });
    });

    contenedor.querySelectorAll('.btn-eliminar-completo').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            eliminarProducto(id);
            renderizarCarritoView(); // Vuelve a renderizar.
        });
    });
}

function renderizarCarritoView() {
    // Dibuja la tabla de productos del carrito y maneja el estado de vacío.
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById('carrito-items-contenedor');
    const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');

    if (!contenedor) return;

    if (carrito.length === 0) {
        // Muestra mensaje de carrito vacío.
        contenedor.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-5">
                    <p class="lead text-muted">El carrito está vacío. ¡Agrega algunos productos!</p>
                </td>
            </tr>
        `;
        // Deshabilita el botón de compra final si no hay ítems.
        if (finalizarCompraBtn) finalizarCompraBtn.disabled = true;
        actualizarResumenCarrito(carrito, 0);
        return;
    }

    // Habilita el botón si hay ítems.
    if (finalizarCompraBtn) finalizarCompraBtn.disabled = false;
    let html = '';
    let subtotalGeneral = 0;

    carrito.forEach(producto => {
        const precioUnitario = producto.precio || 0;
        const subtotalProducto = precioUnitario * producto.cantidad;
        subtotalGeneral += subtotalProducto;

        // Generación de cada fila de la tabla del carrito.
        html += `
            <tr data-id="${producto.id}">
                <td><img src="${producto.imagen || '../assets/img/default-placeholder.jpg'}" class="img-thumbnail" style="width: 80px;" alt="${producto.nombre}"></td>
                <td>${producto.nombre}</td>
                <td class="text-center">$${precioUnitario.toLocaleString('es-ES')}</td>
                <td class="text-center">
                    <div class="input-group input-group-sm justify-content-center">
                        <button class="btn btn-outline-secondary btn-decrementar" data-id="${producto.id}" ${producto.cantidad <= 1 ? 'disabled' : ''}>-</button>
                        <input type="text" class="form-control text-center cantidad-input" value="${producto.cantidad}" readonly style="width: 50px;">
                        <button class="btn btn-outline-secondary btn-aumentar" data-id="${producto.id}">+</button>
                    </div>
                </td>
                <td class="text-end">$${subtotalProducto.toLocaleString('es-ES')}</td>
                <td><button class="btn btn-sm btn-outline-danger btn-eliminar-completo" data-id="${producto.id}">×</button></td>
            </tr>
        `;
    });

    contenedor.innerHTML = html;

    adjuntarEventosCarritoView(contenedor);
    actualizarResumenCarrito(carrito, subtotalGeneral);
}

// ----------------------------------------------------
// INICIALIZACIÓN PRINCIPAL
// ----------------------------------------------------

const ID_CONTENEDOR_DESTACADOS = 'contenedor-destacados';
const ID_CONTENEDOR_AURICULARES = 'contenedor-ofertas';

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerDataCatalogo();

    const contenedorDestacados = document.getElementById(ID_CONTENEDOR_DESTACADOS);
    const contenedorAuriculares = document.getElementById(ID_CONTENEDOR_AURICULARES);

    // Inicializa la vista de la página de inicio (con múltiples secciones) o de categorías (con una única sección).
    if (contenedorDestacados && contenedorAuriculares) {
        inicializarPagina('Ofertas', ID_CONTENEDOR_DESTACADOS);
        inicializarPagina('Auriculares', ID_CONTENEDOR_AURICULARES);

    } else {
        const categoriaUnica = document.body.getAttribute('data-categoria');
        const contenedorUnicoId = 'productos-contenedor';

        if (categoriaUnica && document.getElementById(contenedorUnicoId)) {
            inicializarPagina(categoriaUnica, contenedorUnicoId);
        }
    }

    const carritoContenedor = document.getElementById('carrito-items-contenedor');
    const formularioPago = document.getElementById('formulario-pago'); 

    if (carritoContenedor) {
        // Si estamos en la página del carrito, inicializamos su vista y lógica.
        renderizarCarritoView();
        manejarCupones();

        if (formularioPago) {
            // Adjunta el listener al envío del formulario.
            formularioPago.addEventListener('submit', function (e) {
                e.preventDefault(); 
                e.stopPropagation();

                // Detiene la compra si el carrito está vacío.
                if (obtenerCarrito().length === 0) {
                    alert("No puedes finalizar la compra con el carrito vacío.");
                    formularioPago.classList.remove('was-validated');
                    return;
                }
                
                // checkValidity() usa los atributos HTML (required, pattern, min/maxlength) para validar.
                if (formularioPago.checkValidity()) {
                    simularFinalizarCompra();
                    formularioPago.classList.remove('was-validated'); 
                } else {
                    // Si falla, agrega la clase para mostrar los mensajes de error de Bootstrap.
                    formularioPago.classList.add('was-validated');
                }
            });
        }
    }

    // Asegura que el contador se muestre en todas las páginas.
    actualizarContadorCarrito();
});