// interactivity.js

document.addEventListener('DOMContentLoaded', () => {
    const labubuImage = document.getElementById('new-labubu-image');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // --- Fonctions de base pour le Drag and Drop ---

    // 1. Démarrer le glissement (quand on clique/touche)
    function dragStart(e) {
        // Déterminer la position initiale de la souris/doigt
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === labubuImage) {
            isDragging = true;
            labubuImage.classList.add('is-dragging'); // Ajout de la classe de style
        }
    }

    // 2. Mettre fin au glissement (quand on relâche)
    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
        labubuImage.classList.remove('is-dragging'); // Retrait de la classe de style
    }

    // 3. Effectuer le glissement (quand la souris/doigt bouge)
    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            // Calculer la nouvelle position de la souris/doigt
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            // Définir le décalage pour le prochain mouvement
            xOffset = currentX;
            yOffset = currentY;

            // Appliquer la transformation pour déplacer l'image
            labubuImage.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    }

    // --- Écouteurs d'événements ---
    labubuImage.addEventListener("mousedown", dragStart);
    labubuImage.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag); // L'écouteur est sur le document pour ne pas perdre le drag si on sort de l'image

    // Événements pour les écrans tactiles
    labubuImage.addEventListener("touchstart", dragStart);
    labubuImage.addEventListener("touchend", dragEnd);
    document.addEventListener("touchmove", drag);
});