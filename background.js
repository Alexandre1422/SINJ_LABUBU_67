document.addEventListener('DOMContentLoaded', function() {
    
    // --- GESTION FLEURS TOURNANTES (MULTI-FLEURS) ---
    // On sélectionne TOUTES les images qui ont la classe "animated-flower"
    const allFlowers = document.querySelectorAll('.animated-flower');

    // On vérifie qu'on a bien trouvé des fleurs
    if (allFlowers.length > 0) {
        const flowerImages = [
            './image/flower1.png',
            './image/flower2.png',
            './image/flower3.png'
        ];
        
        let currentImageIndex = 0;
        
        function changeFlowerImage() {
            // Calcul de l'index suivant
            currentImageIndex = (currentImageIndex + 1) % flowerImages.length;
            
            // On boucle sur CHAQUE fleur trouvée pour changer son image
            allFlowers.forEach(flower => {
                flower.src = flowerImages[currentImageIndex];
            });
        }
        
        // Change les images toutes les 3 secondes
        setInterval(changeFlowerImage, 3000);
    }

    // ... (Le reste de ton code pour le snake et l'image clignotante reste inchangé) ...
    // --- GESTION IMAGE CLIGNOTANTE & LANCEMENT SNAKE ---
    const flashImageBottom = document.getElementById('flash-image-bottom');
    // ... etc ...
    let flashInterval;

    if (flashImageBottom) {
        
        // 1. Fonction pour l'animation de clignotement (Slide Up)
        function toggleFlashImage() {
            flashImageBottom.classList.add('is-visible-slide');
            setTimeout(() => {
                // On ne retire la classe que si le bouton est censé être visible (jeu pas lancé)
                if (flashImageBottom.style.display !== 'none') {
                    flashImageBottom.classList.remove('is-visible-slide');
                }
            }, 2000); 
        }

        // On lance l'animation
        toggleFlashImage();
        flashInterval = setInterval(toggleFlashImage, 5000);

        // 2. CLICK : Lancer le jeu
        flashImageBottom.addEventListener('click', () => {
            console.log("Lancement du Snake !");
            
            // a) Masquer le bouton
            flashImageBottom.style.display = 'none';
            flashImageBottom.classList.remove('is-visible-slide'); // Reset animation
            
            // b) Arrêter l'intervalle de clignotement pour économiser des ressources
            clearInterval(flashInterval);

            // c) Appeler la fonction globale définie dans snake.js
            if (window.startSnakeFromBottom) {
                window.startSnakeFromBottom();
            }
        });

        // 3. ÉCOUTER LA FIN DU JEU (Game Over)
        document.addEventListener('snake-game-over', () => {
            console.log("Game Over reçu - Réapparition du bouton");
            
            // a) Réafficher le bouton
            flashImageBottom.style.display = 'block';
            
            // b) Relancer l'intervalle de clignotement
            toggleFlashImage(); // Le faire apparaître tout de suite
            if (flashInterval) clearInterval(flashInterval);
            flashInterval = setInterval(toggleFlashImage, 5000);
        });
    }
});