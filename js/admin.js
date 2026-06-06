// URL base de tu backend en Render
const API_URL = "https://api-libretas.onrender.com/api/productos";

// Esperamos que el HTML cargue para que JS encuentre los IDs sin problemas
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-producto");

    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Capturamos los valores usando tus IDs exactos de admin.html
            const titulo = document.getElementById("cms-titulo").value;
            const descripcion = document.getElementById("cms-descripcion").value;
            const precio = document.getElementById("cms-precio").value;
            const stock = document.getElementById("cms-stock").value;
            const imagen = document.getElementById("cms-imagen").value; 

            // Armamos el objeto JSON limpio para enviar
            const datosProducto = {
                titulo: titulo,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                imagen: imagen
            };

            try {
                const respuesta = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datosProducto)
                });

                if (respuesta.ok) {
                    alert("¡Diseño exclusivo guardado con éxito! 🚀");
                    formulario.reset();
                    obtenerProductos(); // Recarga la lista de abajo automáticamente
                } else {
                    const errorData = await respuesta.json();
                    alert(`Error del servidor: ${errorData.error}`);
                }
            } catch (error) {
                console.error("Error en la petición POST:", error);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }

    // Cargamos los productos la primera vez que se entra al panel
    obtenerProductos();
});

// 2. PETICIÓN GET: Traer los productos desde el backend para listarlos
async function obtenerProductos() {
    try {
        const respuesta = await fetch(API_URL);
        if (respuesta.ok) {
            const productos = await respuesta.json();
            mostrarProductosAdmin(productos);
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

// 3. RENDERIZAR: Dibujar los productos en la lista del panel con botón de borrar
function mostrarProductosAdmin(productos) {
    const listaAdmin = document.getElementById("lista-productos-admin");
    if (!listaAdmin) return;
    
    if (productos.length === 0) {
        listaAdmin.innerHTML = "<p style='color: #666; font-style: italic;'>No hay productos cargados en la tienda todavía.</p>";
        return;
    }

    listaAdmin.innerHTML = "";

    productos.forEach(prod => {
        listaAdmin.innerHTML += `
            <div class="item-admin" style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center; padding: 10px; border-bottom: 1px solid #ddd; background: #fff; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${prod.imagen}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;" onerror="this.src='https://via.placeholder.com/45?text=Error'">
                    <span style="color: #333;"><strong>${prod.titulo}</strong> - $${prod.precio} (Stock: ${prod.stock})</span>
                </div>
                <button onclick="eliminarProducto('${prod._id}')" style="background-color: #ff4d4d; color: white; border: none; padding: 6px 14px; cursor: pointer; border-radius: 4px; font-weight: bold;">
                    Borrar 🗑️
                </button>
            </div>
        `;
    });
}

// 4. PETICIÓN DELETE: Función global para borrar el producto usando su ID único
window.eliminarProducto = async function(id) {
    const confirmar = confirm("¿Estás seguro de que querés borrar este producto del catálogo?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            alert("Producto eliminado con éxito de la base de datos.");
            obtenerProductos(); // Vuelve a pedir los datos actualizados a Render para quitarlo de pantalla al instante
        } else {
            const errorData = await respuesta.json();
            alert(`No se pudo borrar: ${errorData.error}`);
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error de red al intentar borrar.");
    }
}