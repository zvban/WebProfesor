// Escuchar el evento del formulario CMS cuando se hace clic en "Guardar"
const formulario = document.getElementById("formulario-producto");

if (formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault(); // Evita que la página se recargue

        // Capturar los valores ingresados por el usuario administrador
        const titulo = document.getElementById("cms-titulo").value;
        const descripcion = document.getElementById("cms-descripcion").value;
        const precio = document.getElementById("cms-precio").value;
        const stock = document.getElementById("cms-stock").value;

        // Crear el objeto que espera nuestro Backend
        const datosProducto = {
            titulo: titulo,
            descripcion: descripcion,
            precio: precio,
            stock: stock
        };

        try {
            // Realizar la petición POST para añadir el producto a la API de Render
            const respuesta = await fetch('https://api-libretas.onrender.com/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indicamos al backend que enviamos JSON
                },
                body: JSON.stringify(datosProducto) // Convertimos el objeto JS a texto JSON
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert("¡Producto añadido exitosamente al CMS!");
                formulario.reset(); // Limpia los campos del formulario
                
                // Si estás en la misma página de la tienda, actualizamos la lista automáticamente
                if (typeof obtenerProductosDelServidor === "function") {
                    obtenerProductosDelServidor();
                }
            } else {
                alert("Error del servidor: " + resultado.error);
            }

        } catch (error) {
            console.error("Error al intentar conectar con el CMS del backend:", error);
            alert("No se pudo conectar con el servidor para guardar el producto.");
        }
    });
}