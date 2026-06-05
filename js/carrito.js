let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito_libretas")) || [];

// 1. OBTENER PRODUCTOS DEL BACKEND EN VIVO
async function obtenerProductosDelServidor() {
    try {
        const respuesta = await fetch('https://api-libretas.onrender.com/api/productos');
        productos = await respuesta.json();
        renderizarProductosEnTienda();
        actualizarContadores();
        renderizarCarrito();
    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        alert("No se pudo cargar el catálogo de libretas en vivo. ¿Prendiste el backend?");
    }
}

// 2. RENDERIZAR TIENDA
function renderizarProductosEnTienda() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const estaAgotado = prod.stock === 0;
                
        contenedor.innerHTML += `
            <div class="item-video">
                <div class="contenedor-foto-producto">
                    <img src="${prod.imagen}" alt="${prod.titulo}" class="foto-producto">
                </div>
                
                <div class="info-premium-video">
                    <span class="video-index">/ DISPONIBLE: ${prod.stock} U.</span>
                    <h3>${prod.titulo}</h3>
                    <p>${prod.descripcion}</p>
                    <span class="video-index" style="font-size: 1.1rem; margin-bottom: 15px;">$${prod.precio}</span>
                    
                    ${estaAgotado 
                        ? `<button class="btn-agotado">Agotado</button>`
                        : `<button class="btn-wsp-premium" style="width:100%; text-align:center;" onclick="agregarAlCarrito(${prod.id})">Añadir al Carrito</button>`
                    }
                </div>
            </div>
        `;
    });
}

// 3. LÓGICA DEL CARRITO
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad < producto.stock) {
            itemEnCarrito.cantidad++;
        } else {
            alert("Disculpas, no hay más stock disponible de este diseño.");
            return;
        }
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarYRenderizar();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarYRenderizar();
}

function guardarYRenderizar() {
    localStorage.setItem("carrito_libretas", JSON.stringify(carrito));
    actualizarContadores();
    renderizarCarrito();
}

function alternarCarrito() {
    document.getElementById("carrito-flotante").classList.toggle("activo");
}

function actualizarContadores() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contadorElemento = document.getElementById("contador-recuento");
    if(contadorElemento) contadorElemento.innerText = totalItems;
}

function renderizarCarrito() {
    const contenedorItems = document.getElementById("carrito-items");
    const contenedorTotal = document.getElementById("carrito-total");
    if (!contenedorItems || !contenedorTotal) return;
    
    contenedorItems.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        contenedorItems.innerHTML += `
            <div class="item-carrito-render">
                <div class="item-carrito-info">
                    <h4>${item.titulo}</h4>
                    <span>${item.cantidad}x - $${item.precio}</span>
                </div>
                <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${item.id})">Quitar</button>
            </div>
        `;
    });

    contenedorTotal.innerText = `$${total}`;
}

// 4. CONEXIÓN CON EL BACKEND PARA PAGAR
async function procesarCompraEnBackend() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    try {
        // Le enviamos el carrito a tu servidor de Node.js
        const respuesta = await fetch('https://api-libretas.onrender.com/api/comprar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemsCarrito: carrito })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            // Si el backend rechaza la compra (ej: alguien más compró la libreta)
            alert(datos.error);
            // Actualizamos la tienda en vivo para mostrar qué se agotó
            obtenerProductosDelServidor(); 
            return;
        }

        // Si todo está perfecto, el servidor nos devuelve el Link de Mercado Pago
        alert(`¡Ticket ${datos.ticket} generado! Redirigiendo a Mercado Pago...`);
        
        // Vaciamos el carrito local porque ya se confirmó el inicio de pago
        carrito = [];
        localStorage.removeItem("carrito_libretas");
        guardarYRenderizar();

        // Mandamos al usuario a pagar
        window.location.href = datos.init_point;

    } catch (error) {
        console.error("Error al procesar el pago:", error);
        alert("Hubo un problema de conexión con el servidor de pagos.");
    }
}

// Iniciar al cargar
window.onload = obtenerProductosDelServidor;