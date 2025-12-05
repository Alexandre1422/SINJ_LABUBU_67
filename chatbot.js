// chatbot.js - Logique du Chatbot

document.addEventListener('DOMContentLoaded', function() {
    const chatIcon = document.getElementById('chat-icon');
    const chatbotFloatingBtn = document.getElementById('chatbot-floating-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('close-chatbot');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chatbot-input');
    const messagesContainer = document.querySelector('.chatbot-messages');
    const typingIndicator = document.querySelector('.typing-indicator');

    // Fonction pour ouvrir/fermer le chatbot
    function openChatbot() {
        chatbotContainer.classList.toggle('active');  // toggle = ouvrir/fermer
        
        // Message de bienvenue au premier clic
        if (chatbotContainer.classList.contains('active') && messagesContainer.children.length === 1) {
            addMessage('Bienvenue utilisateur. Je suis l\'Assistant SINJ n°67B32, système neuronal quantique de dernière génération. Mes capacités sont... euh... où j\'en étais déjà ? 🤖✨', 'bot');
        }
    }

    // Ouvrir avec l'icône bleue en haut
    if (chatIcon) {
        chatIcon.addEventListener('click', openChatbot);
    }

    // Ouvrir avec le bouton flottant Labubu (NOUVEAU)
    if (chatbotFloatingBtn) {
        chatbotFloatingBtn.addEventListener('click', openChatbot);
    }

    // Fermer le chatbot
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            chatbotContainer.classList.remove('active');
        });
    }

    // Fonction pour ajouter un message
    function addMessage(text, sender, isGif = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        if (isGif) {
            // Créer une image pour le GIF
            const gifImg = document.createElement('img');
            gifImg.src = text;
            gifImg.style.maxWidth = '100%';
            gifImg.style.borderRadius = '10px';
            gifImg.alt = 'GIF';
            messageDiv.appendChild(gifImg);
        } else {
            messageDiv.textContent = text;
        }
        
        // Insérer avant l'indicateur de frappe
        messagesContainer.insertBefore(messageDiv, typingIndicator);
        
        // Scroll automatique vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Fonction pour afficher l'indicateur de frappe
    function showTypingIndicator() {
        typingIndicator.classList.add('active');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Fonction pour masquer l'indicateur de frappe
    function hideTypingIndicator() {
        typingIndicator.classList.remove('active');
    }

    // Fonction pour envoyer le message au backend
    async function sendMessage() {
        const message = chatInput.value.trim();
        
        if (message === '') return;

        // Afficher le message de l'utilisateur
        addMessage(message, 'user');
        chatInput.value = '';

        // Afficher l'indicateur de frappe
        showTypingIndicator();

        try {
            // Envoyer la requête au serveur Flask
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Erreur réseau');
            }

            const data = await response.json();
            
            // Simuler un petit délai pour rendre l'effet plus réaliste
            setTimeout(() => {
                hideTypingIndicator();
                
                // Vérifier si c'est un GIF ou du texte
                if (data.type === 'gif') {
                    addMessage(data.url, 'bot', true);  // true = c'est un GIF
                } else {
                    addMessage(data.response, 'bot', false);  // false = texte normal
                }
            }, 500);

        } catch (error) {
            console.error('Erreur:', error);
            hideTypingIndicator();
            addMessage('Désolé, je rencontre un problème de connexion. Veuillez réessayer.', 'bot');
        }
    }

    // Événement clic sur le bouton envoyer
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Événement touche Entrée
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});