document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner toutes les vidéos du carrousel (supposons 3 vidéos)
    const videos = document.querySelectorAll('.carousel-video');
    let currentIndex = 0;
    
    // Ceci définit l'intervalle de temps entre les changements de vidéo à 18 secondes.
    const intervalTime = 18000; // 18 secondes en millisecondes

    // Fonction pour démarrer la lecture de la vidéo active
    function startActiveVideo(videoElement) {
        videoElement.play().catch(error => {
            console.warn("Autoplay bloqué, l'utilisateur devra interagir. Erreur: ", error);
        });
    }

    function changeVideo() {
        // 1. Gérer la vidéo actuellement active
        const currentVideo = videos[currentIndex];
        currentVideo.classList.remove('active');
        currentVideo.pause(); // Pauser l'ancienne vidéo

        // 2. Calculer l'index de la prochaine vidéo
        // Le modulo (%) assure que l'index revient à 0 après la dernière vidéo.
        // Exemple (avec 3 vidéos) : (2 + 1) % 3 = 3 % 3 = 0 (revient au début)
        currentIndex = (currentIndex + 1) % videos.length;

        // 3. Gérer la nouvelle vidéo active
        const nextVideo = videos[currentIndex];
        nextVideo.classList.add('active');
        nextVideo.currentTime = 0; 
        startActiveVideo(nextVideo); 
    }

    // Lancer la lecture de la première vidéo au démarrage
    startActiveVideo(videos[currentIndex]); 
    
    // Démarrer la rotation du carrousel
    // Cette fonction appellera changeVideo() toutes les 18000 ms (18 secondes)
    setInterval(changeVideo, intervalTime);

    console.log(`Carrousel vidéo initialisé. Les vidéos changeront toutes les ${intervalTime / 1000} secondes.`);
});