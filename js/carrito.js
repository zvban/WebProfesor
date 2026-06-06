let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito_libretas")) || [];

// Iniciar al cargar
window.onload = () => {
    obtenerProductosDelServidor();
};

// 1. OBTENER PRODUCTOS DEL BACKEND
async function obtenerProductosDelServidor() {
    try {
        const respuesta = await fetch('https://api-libretas.onrender.com/api/productos');
        productos = await respuesta.json();
        renderizarProductosEnTienda();
        actualizarContadores();
        renderizarCarrito();
    } catch (error) {
        console.error("Error al conectar con el backend:", error);
    }
}

// 2. RENDERIZAR TIENDA (Actualizado para el CSS Premium)
function renderizarProductosEnTienda() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;
    contenedor.innerHTML = ""; 

    productos.forEach((prod, index) => {
        const estaAgotado = prod.stock === 0;
        const numero = (index + 1).toString().padStart(2, '0');
        
        // Verifica cómo se llama la propiedad de tu imagen en el backend. 
        // Asumí que es prod.imagen. Si no hay imagen, pone un espacio gris.
        const urlImagen = prod.imagen ? prod.imagen : 'https://via.placeholder.com/400?text=Sin+Imagen';

        contenedor.innerHTML += `
            <div class="item-servicio">
                <div class="img-producto-contenedor">
                    <img src="${urlImagen}" alt="${prod.titulo}">
                </div>
                <div class="item-servicio-contenido">
                    <span class="numero-decorativo">${numero}</span>
                    <h3>${prod.titulo}</h3>
                    <p style="color: #c7d2de; font-size: 0.9rem; margin-bottom: 10px;">${prod.descripcion}</p>
                    <div class="precio-stock">
                        <span style="color:#ffffff;">$${prod.precio}</span> | 
                        <span>${estaAgotado ? "Agotado" : "Disponibles: " + prod.stock}</span>
                    </div>
                    <button class="${estaAgotado ? 'btn-agotado' : 'btn-carrito'}" 
                            ${estaAgotado ? 'disabled' : `onclick="agregarAlCarrito(${prod.id})"`}>
                        ${estaAgotado ? "Agotado" : "Añadir al Carrito"}
                    </button>
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
            alert("Disculpas, no hay más stock disponible.");
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

// 4. ACTUALIZACIÓN AUTOMÁTICA DEL CONTADOR
function actualizarContadores() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contadorElemento = document.getElementById("contador-recuento");
    
    if(contadorElemento) {
        contadorElemento.innerText = totalItems;
        // La burbuja se oculta si es 0
        contadorElemento.style.display = totalItems > 0 ? "inline-block" : "none";
    }
}

// 5. REDIRECCIÓN A WHATSAPP
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let mensaje = "¡Hola! Quiero realizar el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        mensaje += `- ${item.titulo} (Cant: ${item.cantidad}) - $${item.precio * item.cantidad}%0A`;
        total += (item.precio * item.cantidad);
    });

    mensaje += `%0A*Total del pedido: $${total}*`;
    mensaje += `%0A%0A¿Podrían confirmarme la disponibilidad?`;

    const numeroWhatsApp = "5493704307901"; 
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    
    window.open(url, '_blank');
}

// 6. RENDERIZAR CARRITO Y BOTÓN WSP
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

    contenedorTotal.innerHTML = `
        <div style="width: 100%;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                <span>Total:</span>
                <span>$${total}</span>
            </div>
            <button class="btn-action-wsp" onclick="enviarPedidoWhatsApp()" style="width: 100%;">Realizar Pedido</button>
        </div>
    `;
}

function alternarCarrito() {
    document.getElementById("carrito-flotante").classList.toggle("activo");
}