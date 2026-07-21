function enviarWhatsApp(){

    let mensaje=document.getElementById("wsp-message").value;

    if(mensaje.trim()===""){

        mensaje="Hola Luciano, vi tu portfolio y me gustaría hablar sobre un proyecto.";

    }

    const numero="5493704582390";

    const url=`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(url,"_blank");

}
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("videoModal");
    const videoFrame = document.getElementById("videoFrame");
    const closeModal = document.querySelector(".close-modal");
    const cards = document.querySelectorAll(".portfolio-card");

    // Abrir modal y cargar el video al hacer clic en una tarjeta
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const videoUrl = card.getAttribute("data-video");
            if (videoUrl) {
                videoFrame.src = videoUrl + "?autoplay=1"; // Agrega autoplay para que inicie al abrir
                modal.classList.add("active"); // Asegúrate de tener clases CSS para mostrarlo
                modal.style.display = "flex";
            }
        });
    });

    // Función para cerrar el modal
    const cerrarModal = () => {
        modal.style.display = "none";
        videoFrame.src = ""; // Detiene el video al cerrar
    };

    closeModal.addEventListener("click", cerrarModal);

    // Cerrar también si se hace clic fuera del contenido del modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });
});