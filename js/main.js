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
    const idNumerico = parseInt(id);
    return catalogoCompleto.find(p => p.id === idNumerico) || null;
}

function obtenerCarrito() {
    const carritoJSON = localStorage.getItem(CARRITO_STORAGE_KEY);
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// ----------------------------------------------------
// NOTIFICACIONES (Toastify)
// ----------------------------------------------------

function mostrarToast(mensaje) {
    if (typeof Toastify === 'undefined') return;
    
    Toastify({
        text: "✅ " + mensaje,
        duration: 1800,
        onClick: function(){ 
            const isRoot = !window.location.pathname.includes('/pages/');
            const carritoUrl = isRoot ? './pages/Carrito.html' : './Carrito.html';
            window.location.href = carritoUrl; 
        } 
    }).showToast();
}

function mostrarToastExito(mensaje) {
    if (typeof Toastify === 'undefined') return;

    Toastify({
        text: "🎉 " + mensaje,
        duration: 4000,
        gravity: "bottom", 
        position: "center", 
        style: {
            background: "linear-gradient(to right, #007bff, #17a2b8)", 
        }
    }).showToast();
}

// ----------------------------------------------------
// LÓGICA DE COMPRA Y RECIBO FICTICIO (MODIFICADA)
// ----------------------------------------------------

function generarReciboHTML(datosFacturacion, carrito, subtotal, descuento, totalFinal) {
    const ahora = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
    const email = datosFacturacion.correo || 'N/A';
    const dni = datosFacturacion.dni || 'N/A';
    
    // Generación de la tabla de productos
    const productosHTML = carrito.map(item => `
        <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${item.nombre}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.cantidad}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">$${item.precio.toLocaleString('es-ES')}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">$${(item.cantidad * item.precio).toLocaleString('es-ES')}</td>
        </tr>
    `).join('');

    // Estilo básico para simular un correo simple y legible
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #007bff;">¡Gracias por tu compra! (Recibo Ficticio)</h2>
            <p><strong>Fecha:</strong> ${ahora}</p>
            <p><strong>Recibo N°:</strong> ${Math.floor(Math.random() * 900000) + 100000}</p>
            
            <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">Datos de Facturación</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>DNI/CUIT:</strong> ${dni}</p>
            <p><strong>CVC:</strong> XXXX</p>

            <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Detalles de la Compra</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f8f8f8;">
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Producto</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Cant.</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">P. Unitario</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>

            <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Resumen de Pago</h3>
            <div style="text-align: right;">
                <p>Subtotal: <strong>$${subtotal.toLocaleString('es-ES')}</strong></p>
                <p style="color: red;">Descuento aplicado: <strong>-$${descuento.toLocaleString('es-ES')}</strong></p>
                <p style="font-size: 1.2em; border-top: 1px solid #333; padding-top: 5px;">Total Final: <strong style="color: #007bff;">$${totalFinal.toLocaleString('es-ES')}</strong></p>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #666;">Este es un recibo de compra simulado.</p>
        </div>
    `;
}

function simularFinalizarCompra(datosFacturacion) {
    const carrito = obtenerCarrito();

    // Calcular totales para el recibo (lógica duplicada de actualizarResumenCarrito para consistencia)
    const subtotalGeneral = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const cuponAplicado = localStorage.getItem('cuponAplicado');
    let descuento = 0;

    if (cuponAplicado === 'JBLFRAN') {
        descuento = subtotalGeneral * 0.20;
    } else if (cuponAplicado === 'JBL10') {
        descuento = subtotalGeneral * 0.10;
    }
    const totalFinal = subtotalGeneral - descuento;
    
    // 1. Generar y mostrar el recibo (Simulación de envío de email)
    const reciboHTML = generarReciboHTML(datosFacturacion, carrito, subtotalGeneral, descuento, totalFinal);
    
    // Abre una nueva ventana/pestaña para mostrar el recibo de manera legible
    const ventanaRecibo = window.open('', 'ReciboFicticio', 'width=800,height=700,scrollbars=yes');
    if (ventanaRecibo) {
        ventanaRecibo.document.write(reciboHTML);
        ventanaRecibo.document.close();
        ventanaRecibo.focus();
    }


    // 2. Notificación de éxito
    mostrarToastExito("🎉 ¡Compra realizada con éxito! Recibo ficticio generado.");

    // 3. Limpiar y redirigir
    setTimeout(() => {
        localStorage.removeItem(CARRITO_STORAGE_KEY);
        localStorage.removeItem('cuponAplicado'); // Limpia el cupón aplicado al finalizar
        
        if (document.getElementById('carrito-items-contenedor')) {
            renderizarCarritoView(); 
        }
        actualizarContadorCarrito();    

        setTimeout(() => {
            window.location.href = '../index.html'; 
        }, 2000); 

    }, 1500); 
}

// ----------------------------------------------------
// GESTIÓN DEL CARRITO
// ----------------------------------------------------

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const contadorDesktop = document.getElementById('contador-carrito');
    const contadorMovil = document.getElementById('contador-carrito-movil'); 

    if (contadorDesktop) {
        contadorDesktop.textContent = totalItems;
        contadorDesktop.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    if (contadorMovil) {
        contadorMovil.textContent = totalItems;
        contadorMovil.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

function agregarAlCarrito(productoData) {
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
    if (document.getElementById('carrito-items-contenedor')) {
        renderizarCarritoView();
    }

    mostrarToast(productoData.nombre + ' agregado al carrito');
}

function decrementarCantidad(id) {
    let carrito = obtenerCarrito();
    const idNumerico = parseInt(id);
    const index = carrito.findIndex(item => item.id === idNumerico);

    if (index !== -1) {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
        } else {
            carrito.splice(index, 1);
        }
    }

    guardarCarrito(carrito);
}

function eliminarProducto(id) {
    let carrito = obtenerCarrito();
    const idNumerico = parseInt(id);
    carrito = carrito.filter(item => item.id !== idNumerico);
    guardarCarrito(carrito);
}

// ----------------------------------------------------
// CARGA DE DATOS DEL CATÁLOGO
// ----------------------------------------------------

async function obtenerDataCatalogo() {
    if (catalogoCompleto.length > 0) return catalogoCompleto;

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
    const catalogo = await obtenerDataCatalogo();
    return catalogo.filter(producto =>
        producto.categoria === categoriaDeseada
    );
}

// ----------------------------------------------------
// FILTROS Y RENDERIZADO EN PÁGINAS DE CATEGORÍA
// ----------------------------------------------------

function aplicarFiltrosYRenderizar(contenedorId) {
    let productosParaMostrar = [...productosBase];

    const maxPriceInput = document.getElementById('rangoPrecio');
    const valorRangoSpan = document.getElementById('valorRango');
    const isEnvioGratisChecked = document.getElementById('envioGratis')?.checked;
    const ordenamiento = document.getElementById('ordenarPrecio')?.value;

    if (document.body.getAttribute('data-categoria')) {

        if (maxPriceInput && valorRangoSpan) {
            const maxPrice = parseInt(maxPriceInput.value);
            productosParaMostrar = productosParaMostrar.filter(producto => {
                const precioAComparar = producto.precio_oferta || producto.precio || 0;
                return precioAComparar <= maxPrice;
            });
        }

        if (isEnvioGratisChecked) {
            productosParaMostrar = productosParaMostrar.filter(producto => producto['envio-gratis'] === true);
        }

        if (ordenamiento && ordenamiento !== 'default') {
            const factor = (ordenamiento === 'minMax') ? 1 : -1;
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
    const contenedor = document.getElementById(elementoContenedorId);
    if (!contenedor) return;

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="alert alert-warning">No se encontraron productos con los filtros aplicados.</p>';
        return;
    }

    contenedor.innerHTML = productos.map(producto => {
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
    productosBase = await obtenerProductosPorCategoria(categoria);
    aplicarFiltrosYRenderizar(contenedorId);

    if (document.body.getAttribute('data-categoria')) {
        const rangoPrecio = document.getElementById('rangoPrecio');
        const ordenarPrecio = document.getElementById('ordenarPrecio');
        const envioGratis = document.getElementById('envioGratis');
        const btnReiniciarFiltros = document.getElementById('btnReiniciarFiltros');

        if (rangoPrecio) rangoPrecio.addEventListener('input', () => aplicarFiltrosYRenderizar(contenedorId));
        if (envioGratis) envioGratis.addEventListener('change', () => aplicarFiltrosYRenderizar(contenedorId));
        if (ordenarPrecio) ordenarPrecio.addEventListener('change', () => aplicarFiltrosYRenderizar(contenedorId));

        if (btnReiniciarFiltros) {
            btnReiniciarFiltros.addEventListener('click', () => {
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
    const aplicarCuponBtn = document.getElementById('aplicarCuponBtn');
    const cuponInput = document.getElementById('cuponInput');
    const cuponMensaje = document.getElementById('cupon-mensaje');

    if (aplicarCuponBtn) {
        aplicarCuponBtn.addEventListener('click', () => {
            const codigo = cuponInput.value.trim().toUpperCase();

            if (codigo === 'JBLFRAN') {
                localStorage.setItem('cuponAplicado', codigo);
                cuponMensaje.textContent = 'Cupón JBLFRAN aplicado con éxito (20% OFF).';
                cuponMensaje.classList.remove('text-muted', 'text-danger');
                cuponMensaje.classList.add('text-success');
            } else if (codigo === 'JBL10') {
                localStorage.setItem('cuponAplicado', codigo);
                cuponMensaje.textContent = 'Cupón JBL10 aplicado con éxito (10% OFF).';
                cuponMensaje.classList.remove('text-muted', 'text-danger');
                cuponMensaje.classList.add('text-success');
            } else {
                localStorage.removeItem('cuponAplicado');
                cuponMensaje.textContent = 'Cupón inválido o expirado.';
                cuponMensaje.classList.remove('text-muted', 'text-success');
                cuponMensaje.classList.add('text-danger');
            }
            renderizarCarritoView();
        });
    }
}

function actualizarResumenCarrito(carrito, subtotal) {
    const cuponAplicado = localStorage.getItem('cuponAplicado');
    let descuento = 0;
    let descuentoPorcentaje = 0;

    if (cuponAplicado === 'JBLFRAN') {
        descuentoPorcentaje = 20;
        descuento = subtotal * 0.20;
    } else if (cuponAplicado === 'JBL10') {
        descuentoPorcentaje = 10;
        descuento = subtotal * 0.10;
    }

    const totalFinal = subtotal - descuento;

    document.getElementById('total-subtotal').textContent = subtotal.toLocaleString('es-ES');
    document.getElementById('total-descuento').textContent = descuento.toLocaleString('es-ES');
    document.getElementById('total-final').textContent = totalFinal.toLocaleString('es-ES');

    const descuentoPorcentajeSpan = document.getElementById('descuento-porcentaje');
    if (descuentoPorcentajeSpan) {
        descuentoPorcentajeSpan.textContent = `${descuentoPorcentaje}%`;
    }
}

function adjuntarEventosCarritoView(contenedor) {
    contenedor.querySelectorAll('.btn-aumentar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const productoData = obtenerProductoData(id);
            if (productoData) {
                agregarAlCarrito(productoData);
            }
        });
    });

    contenedor.querySelectorAll('.btn-decrementar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            decrementarCantidad(id);
            renderizarCarritoView();
        });
    });

    contenedor.querySelectorAll('.btn-eliminar-completo').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            eliminarProducto(id);
            renderizarCarritoView();
        });
    });
}

function renderizarCarritoView() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById('carrito-items-contenedor');
    const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
    const cuponMensaje = document.getElementById('cupon-mensaje');

    if (!contenedor) return;

    if (carrito.length === 0) {
        localStorage.removeItem('cuponAplicado'); // Se remueve el cupón si el carrito se vacía

        contenedor.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-5">
                    <p class="lead text-muted">El carrito está vacío. ¡Agrega algunos productos!</p>
                </td>
            </tr>
        `;
        if (finalizarCompraBtn) finalizarCompraBtn.disabled = true;
        actualizarResumenCarrito(carrito, 0);
        if (cuponMensaje) {
             cuponMensaje.textContent = 'Ingresa tu cupón aquí.';
             cuponMensaje.classList.remove('text-success', 'text-danger');
             cuponMensaje.classList.add('text-muted');
        }
        return;
    }

    if (finalizarCompraBtn) finalizarCompraBtn.disabled = false;
    let html = '';
    let subtotalGeneral = 0;

    carrito.forEach(producto => {
        const precioUnitario = producto.precio || 0;
        const subtotalProducto = precioUnitario * producto.cantidad;
        subtotalGeneral += subtotalProducto;

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
        renderizarCarritoView();
        manejarCupones();

        if (formularioPago) {
            formularioPago.addEventListener('submit', function (e) {
                e.preventDefault(); 
                e.stopPropagation();

                if (obtenerCarrito().length === 0) {
                    alert("No puedes finalizar la compra con el carrito vacío.");
                    formularioPago.classList.remove('was-validated');
                    return;
                }
                
                if (formularioPago.checkValidity()) {
                    // Extraer los datos del formulario antes de simular la compra
                    const datosFacturacion = {
                        cvc: document.getElementById('cvc').value,
                        dni: document.getElementById('titularDNI').value,
                        correo: document.getElementById('correo').value
                    };
                    
                    simularFinalizarCompra(datosFacturacion);
                    formularioPago.classList.remove('was-validated'); 
                } else {
                    formularioPago.classList.add('was-validated');
                }
            });
        }
    }

    actualizarContadorCarrito();
});