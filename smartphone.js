        const playButton = document.getElementById('playButton');
        const powerButton = document.getElementById('powerButton');
        const homeButton = document.getElementById('homeButton');
        
        const firstApp = document.getElementById('firstApp');
        const secondApp = document.getElementById('secondApp');
        const thirdApp = document.getElementById('thirdApp'); // NOUVEAU
        
        const screen = document.getElementById('screen');
        const newModal = document.getElementById('newModal');
        const refurbModal = document.getElementById('refurbModal');
        const likeModal = document.getElementById('likeModal');

        // --- Fonctions Modales existantes ---
        function closeModal() {
            newModal.classList.remove('active');
            refurbModal.classList.remove('active');
        }
        function closeLikeModal() {
            likeModal.classList.remove('active');
        }
        function openModal(type) {
            if (type === 'new') newModal.classList.add('active');
            else if (type === 'refurb') refurbModal.classList.add('active');
        }

        // --- Event Listeners existants ---
        const likeButton = document.querySelector('.post-action');
        if (likeButton) {
            likeButton.addEventListener('click', () => likeModal.classList.add('active'));
        }

        document.querySelectorAll('.product-button').forEach((button, index) => {
            button.addEventListener('click', function() {
                if (index === 0) openModal('new');
                else if (index === 1) openModal('refurb');
            });
        });

        // Fermeture modales au clic extérieur
        window.onclick = function(event) {
            if (event.target == newModal || event.target == refurbModal) closeModal();
            if (event.target == likeModal) closeLikeModal();
        }

        // --- NAVIGATION TÉLÉPHONE ---

        playButton.addEventListener('click', function() {
            screen.classList.toggle('active');
        });

        // Bouton Power : On éteint tout (Reset des classes)
        powerButton.addEventListener('click', function() {
            screen.classList.remove('active', 'app-view', 'app2-view', 'app3-view');
            closeModal();
            closeLikeModal();
            resetQuiz(); // Optionnel : remettre le quiz à zéro
        });

        // Bouton Home : Retour au menu principal (Reset des vues apps)
        homeButton.addEventListener('click', function() {
            screen.classList.remove('app-view', 'app2-view', 'app3-view');
            screen.classList.add('active');
            closeModal();
            closeLikeModal();
            resetQuiz(); // Optionnel
        });

        // App 1 : Réseau Social
        firstApp.addEventListener('click', function() {
            screen.classList.add('app-view');
            screen.classList.remove('app2-view', 'app3-view');
            closeModal();
        });

        // App 2 : Shop
        secondApp.addEventListener('click', function() {
            screen.classList.add('app2-view');
            screen.classList.remove('app-view', 'app3-view');
            closeModal();
        });

        // App 3 : Quiz (NOUVEAU)
        thirdApp.addEventListener('click', function() {
            screen.classList.add('app3-view');
            screen.classList.remove('app-view', 'app2-view');
            closeModal();
        });

        // --- LOGIQUE DU QUIZ (NOUVEAU) ---
        // --- LOGIQUE DU QUIZ ---
        function checkAnswer(btn, isCorrect, explanationText) {
            // Trouve le conteneur parent (le quiz-item)
            const parent = btn.parentElement.parentElement; // Remonte au .quiz-item
            const feedback = parent.querySelector('.quiz-feedback');
            const buttons = parent.querySelectorAll('.quiz-btn');

            // Désactiver TOUS les boutons après réponse
            buttons.forEach(b => {
                b.disabled = true;
                // Griser légèrement les boutons non cliqués pour focus sur le résultat
                if (b !== btn) b.style.opacity = '0.6';
            });

            // Afficher le feedback
            feedback.classList.add('visible');

            if (isCorrect) {
                btn.style.backgroundColor = '#d1e7dd'; // Vert clair fond
                btn.style.borderColor = '#198754'; // Vert bordure
                btn.style.color = '#0f5132'; // Vert texte
                btn.innerHTML = "✅ " + btn.innerHTML; // Ajout coche
                
                feedback.innerHTML = "<strong>Exact !</strong><br>" + explanationText;
                feedback.style.color = '#0f5132';
                feedback.style.borderLeftColor = '#198754';
            } else {
                btn.style.backgroundColor = '#f8d7da'; // Rouge clair fond
                btn.style.borderColor = '#dc3545'; // Rouge bordure
                btn.style.color = '#842029'; // Rouge texte
                btn.innerHTML = "❌ " + btn.innerHTML; // Ajout croix

                feedback.innerHTML = "<strong>Dommage...</strong><br>" + explanationText;
                feedback.style.color = '#842029';
                feedback.style.borderLeftColor = '#dc3545';
                
                // Optionnel : Montrer quelle était la bonne réponse visuellement
                // On pourrait parcourir les boutons pour trouver celui qui a 'checkAnswer(this, true'
                // mais dans ce code simple, l'explication suffit souvent.
            }
        }

function resetQuiz() {
            // Remettre les boutons à leur état initial
            const allBtns = document.querySelectorAll('.quiz-btn');
            allBtns.forEach(b => {
                b.disabled = false;
                b.style.backgroundColor = '#fff';
                b.style.color = '#333';
                b.style.borderColor = '#ccc';
                b.style.opacity = '1';
                // Nettoyer les icônes ✅/❌ si besoin (nécessite de stocker le texte original, 
                // ou simplement recharger la page, mais pour une démo simple on laisse comme ça)
                // Une solution simple est de retirer les 2 premiers caractères si c'est une icone
                if(b.innerText.startsWith("✅ ") || b.innerText.startsWith("❌ ")) {
                    b.innerText = b.innerText.substring(2);
                }
            });
            
            const allFeedbacks = document.querySelectorAll('.quiz-feedback');
            allFeedbacks.forEach(f => {
                f.textContent = '';
                f.classList.remove('visible');
            });
        }

        // --- Récupération des éléments ---
const fourthApp = document.getElementById('fourthApp');
const fullScreenContainer = document.getElementById('fullScreenPacman');
const pacmanFrame = document.getElementById('pacmanFrame');
const closePacmanBtn = document.getElementById('closePacman');

// --- OUVRIR PACMAN (Plein écran) ---
fourthApp.addEventListener('click', function() {
    // 1. Charger le jeu
    pacmanFrame.src = "./pacman.js"; // Oups, erreur dans votre demande, c'est pacman.html qu'il faut charger
    pacmanFrame.src = "./pacman.html"; 
    
    // 2. Afficher l'overlay
    fullScreenContainer.classList.add('active');
    
    // 3. Donner le focus à l'iframe pour que les touches du clavier marchent direct
    pacmanFrame.onload = function() {
        pacmanFrame.contentWindow.focus();
    };
});

// --- FERMER PACMAN ---
closePacmanBtn.addEventListener('click', function() {
    // 1. Cacher l'overlay
    fullScreenContainer.classList.remove('active');
    
    // 2. Vider la source pour "tuer" le jeu (stop musique/boucle)
    pacmanFrame.src = "";
    
    // 3. Optionnel : Revenir à l'écran d'accueil du téléphone ou rester dans le menu app
});
