

document.addEventListener('DOMContentLoaded', function() {
    const chatIcon = document.getElementById('chat-icon');
    const rotatingFlower = document.getElementById('rotating-flower');
    
    // --- Gestion du Chat (Inchanggée) ---
    if (chatIcon) {
        chatIcon.addEventListener('click', function() {
            alert("L'icône de chat a été cliquée ! Le script fonctionne.");
            this.style.border = '2px solid navy';
        });
    }

    // --- Gestion de l'Animation de la Fleur (NOUVEAU) ---
    if (rotatingFlower) {
        // Liste des images de fleurs disponibles
        const flowerImages = [
            'image/flower1.png',
            'image/flower2.png',
            'image/flower3.png'
            // Vous pouvez ajouter d'autres images ici (ex: 'flower4.png')
        ];
        
        let currentImageIndex = 0;
        
        // Fonction qui change l'image
        function changeFlowerImage() {
            // Passe à l'image suivante
            currentImageIndex = (currentImageIndex + 1) % flowerImages.length;
            
            // Met à jour l'attribut 'src' de l'image
            rotatingFlower.src = flowerImages[currentImageIndex];
            
            console.log("Image changée pour : " + rotatingFlower.src);
        }
        
        // Exécute la fonction 'changeFlowerImage' toutes les 2000 millisecondes (2 secondes).
        // Cela correspond à la durée de l'animation CSS 'rotate-flower 2s'.
        setInterval(changeFlowerImage, 3000);
    } else {
        console.error("Erreur: L'élément avec l'ID 'rotating-flower' n'a pas été trouvé.");
    }
});

// --- Code à ajouter à background.js ---
// --- Code à modifier dans background.js ---

// --- Code à modifier dans background.js ---

document.addEventListener('DOMContentLoaded', () => {
    
    const flashImageBottom = document.getElementById('flash-image-bottom');
    if (!flashImageBottom) return; 

    function toggleFlashImage() {
        
        // 1. Afficher l'image avec l'effet de "montée" (pendant 2 secondes)
        // Ajout de la classe qui active opacity: 1 et transform: translateY(0)
        flashImageBottom.classList.add('is-visible-slide');
        
        // 2. Planifier la disparition après 2 secondes
        setTimeout(() => {
            // Retirer la classe pour la masquer et la déplacer à nouveau vers le bas
            flashImageBottom.classList.remove('is-visible-slide');
        }, 2000); // 2000 ms = 2 secondes d'affichage
    }

    // Démarrer le cycle
    toggleFlashImage(); 

    // Répéter le cycle toutes les 5 secondes (2s affiché + 3s masqué = 5s)
    setInterval(toggleFlashImage, 5000); 

    // ... (votre code pour la fleur tournante si nécessaire) ...
});

