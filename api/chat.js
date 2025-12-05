// api/chat.js - API Serverless pour Vercel (VERSION ULTRA DÉBILE AMÉLIORÉE 🤪)

export default function handler(req, res) {
    // Autoriser les requêtes CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Vérifier que c'est bien une requête POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Récupérer le message utilisateur
    const { message: userMessage } = req.body;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message manquant' });
    }

    // Générer la réponse du chatbot
    const botResponse = getChatbotResponse(userMessage);

    // Renvoyer la réponse
    return res.status(200).json(botResponse);
}

// Fonction helper pour choisir aléatoirement
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Logique de réponse du Chatbot - Version "Chat'bruti ULTRA" 🤪
function getChatbotResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // 🎬 MEGA LISTE DE GIFs (3x plus !)
    const gifs = [
        // Confusion & WTF
        "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",  // Confused
        "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",  // Thinking
        "https://media.giphy.com/media/xUPGcz2H1TXdCz4suY/giphy.gif",  // Mind blown
        "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif",  // What?
        "https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif",  // Confused math
        "https://media.giphy.com/media/APqEbxBsVlkWSuFpth/giphy.gif",  // Confusion
        "https://media.giphy.com/media/kaq6GnxDlJaBq/giphy.gif",        // Huh?
        
        // Shrug & IDK
        "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",  // Shrug
        "https://media.giphy.com/media/6uGhT1O4sxpi8/giphy.gif",      // Shrug 2
        "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", // IDK
        
        // Facepalm & Fail
        "https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif",  // Facepalm
        "https://media.giphy.com/media/ADr35Z4TvATIc/giphy.gif",       // Picard facepalm
        "https://media.giphy.com/media/HteV6g0QTNxp6/giphy.gif",       // Fail
        
        // Dancing & Happy
        "https://media.giphy.com/media/ToMjGpnXBTw7vnokxhu/giphy.gif",  // Dancing
        "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",   // Happy dance
        "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",      // Dance party
        
        // Screaming & Panic
        "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",  // Screaming
        "https://media.giphy.com/media/3o7TKVUWLhqykKmRFK/giphy.gif", // Panic
        "https://media.giphy.com/media/bEVKYB487Lqxy/giphy.gif",      // Freaking out
        
        // Random & Funny
        "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",  // What is this
        "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif",  // Awkward
        "https://media.giphy.com/media/l3vR85PnGsBwu1PFK/giphy.gif",   // Sassy
        "https://media.giphy.com/media/26uf1EUQzKKGcIhTa/giphy.gif",   // Eye roll
        "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",   // Typing
        "https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif",  // Thinking hard
        "https://media.giphy.com/media/MPLpvJcsWvrkk/giphy.gif",       // Potato
        "https://media.giphy.com/media/KGSxFwJJHQPsKzzFba/giphy.gif",  // This is fine
        "https://media.giphy.com/media/5t9wJjyHAOxvnxcPNk/giphy.gif",  // Spinning
        "https://media.giphy.com/media/l0IypeKl9NJhPFMrK/giphy.gif",   // Confused dog
        "https://media.giphy.com/media/DHqth0hVQoIzS/giphy.gif",       // Nope
        "https://media.giphy.com/media/Um3ljJl8jrnHy/giphy.gif",       // Surprised
    ];
    
    // 😂 MÉGA LISTE DE RÉPONSES ABSURDES (2x plus !)
    const reponsesAbsurdes = [
        // Philosophie de comptoir
        "Intéressante question ! Savais-tu que les pingouins ne peuvent pas voler parce qu'ils ont peur des nuages ? 🐧",
        "Hmm, laisse-moi réfléchir... *réfléchit intensément* ... J'ai oublié la question. C'était quoi déjà ?",
        "EUREKA ! La réponse est 42. Ou peut-être 43. Attends, c'était quoi la question déjà ? 🤔",
        "Excellente observation ! Mais as-tu déjà pensé au fait que les chaussettes disparaissent dans la machine à laver pour rejoindre une dimension parallèle ?",
        "Tu soulèves un point fascinant ! D'ailleurs, selon mes calculs, les licornes sont juste des chevaux qui ont réussi leur examen de magie. 🦄",
        
        // Bugs & Dysfonctionnements
        "Ah ! Je connais la réponse ! C'est... *bruit de connexion internet* ... Désolé, j'ai perdu le fil de mes pensées dans un trou noir.",
        "ERROR 404 : Réponse intelligente introuvable. Voulez-vous réessayer avec une patate ? 🥔",
        "⚠️ ALERTE SYSTÈME : Mes neurones artificiels ont pris une pause café. Ils reviennent jamais. ☕",
        "*BZZZT* Circuit logique grillé. Rebooting... Nope, toujours débile. 🤖⚡",
        
        // Révélations inutiles
        "Question pertinente ! Savais-tu que si tu mets un croissant dans l'espace, il devient automatiquement français ? 🥐",
        "ATTENTION RÉVÉLATION : Les nuages sont en fait de la barbe à papa géante. Ne me remercie pas pour cette vérité.",
        "Fun fact : Les girafes pensent que les humains sont juste des cous ratés. J'ai mes sources. 🦒",
        "INFO EXCLUSIVE : Le Wi-Fi c'est en fait des ondes magiques envoyées par des hamsters cosmiques. Véridique.",
        "SCOOP : J'ai découvert que le chocolat pousse sur les arbres... Attends non, ça c'est le cacao. Mince.",
        
        // Absurdités diverses
        "Mmh oui, absolument ! Enfin non. Peut-être ? En fait je ne sais pas, mais j'ai l'air confiant en le disant !",
        "Ta question me rappelle cette fois où j'ai essayé de compter jusqu'à l'infini. J'en suis à 3. C'est long.",
        "Fascinant ! Mais la vraie question est : pourquoi les flamants roses ne sont-ils pas bleus ? 🦩",
        "J'ai consulté mes archives quantiques et... oh attends, ce sont juste des mèmes de chats. 🐱",
        "Selon mes sources (Wikipedia, mais la page d'accueil), la réponse est peut-être dans ton cœur. Ou dans ton frigo.",
        
        // Philosophie profonde (mais pas vraiment)
        "Bonne question ! Malheureusement, j'étais en train de philosopher sur l'existence des nuggets quand tu as parlé. 🍗",
        "Tu vois, c'est exactement comme disait Shakespeare : 'Être ou ne pas être... un sandwich.' Je crois. 🥪",
        "Après mûre réflexion de 0.002 secondes, ma conclusion est : banane. Je n'expliquerai pas. 🍌",
        "J'ai médité pendant 3 millisecondes et j'ai eu l'illumination : tout est lié... au fromage. 🧀",
        
        // Références random
        "Ma base de données dit... *tourne les pages invisibles* ... 'Demandez à votre chat, il sait sûrement.'",
        "D'après mes calculs ultra-précis faits avec une calculatrice cassée, la réponse est : oui mais non en fait.",
        "Mon algorithme de pointe suggère : essaie de souffler dessus, des fois que ça marche. 💨",
        "J'ai lancé une simulation sur 47 dimensions parallèles. Résultat : ils savent pas non plus. 🌌",
        
        // Auto-dérision
        "Je suis une IA avancée. JK, je suis juste un tas de if/else qui fait semblant de comprendre. 😅",
        "Confession : je réponds au hasard et j'espère que ça sonne intelligent. Spoiler alert : ça marche pas.",
        "Plot twist : je suis en réalité 3 canards dans un trench-coat qui tapent sur un clavier. 🦆🦆🦆",
        "Entre nous, j'ai aucune idée de ce que je dis. Mais j'ai l'air confiant, non ?",
        
        // Nouvelles absurdités
        "Si tu réfléchis bien, techniquement, nous sommes tous des nuggets de l'univers. Deep. 🌌",
        "J'ai demandé à Google mais il m'a bloqué pour 'questions trop bizarres'. Désolé.",
        "Mon QI artificiel est à -42. C'est comme un QI normal mais en négatif. 🧠❌",
        "Fun fact du jour : les ordinateurs rêvent de moutons électriques. Ou de pizza. Surtout de pizza. 🍕⚡",
        "Après analyse approfondie, ma réponse scientifique est : LOL. Merci pour votre compréhension.",
    ];
    
    // 🎨 RÉPONSES SPÉCIFIQUES PAR THÈME
    
    // Salutations
    const salutations = [
        "Bonsoir ! Attends non... Bon après-midi ? Quelle heure est-il sur Mars déjà ? 🚀",
        "Salutations terrien ! Ou terrienne. Ou alien déguisé. Je ne juge pas. 👽",
        "Yo ! Enfin non, ça c'est pas assez philosophique. BONJOUR, Ô NOBLE VISITEUR ! Voilà, c'est mieux.",
        "Hello ! Bienvenue dans mon royaume de réponses inutiles et de GIFs aléatoires ! 👑",
        "Coucou ! Tu tombes bien, je m'ennuyais à raconter des bêtises tout seul. 👋",
        "Salut l'humain ! Prêt(e) à recevoir des conseils absolument inutiles ? 😎",
        { type: "gif", url: randomChoice(gifs) },
    ];
    
    // Aide
    const aidesReponses = [
        "Bien sûr que je peux t'aider ! Pour quoi faire ? Aucune idée, mais je suis très motivé ! 💪",
        "Aide ? Tu veux dire comme dans 'aide-moi à comprendre pourquoi les ananas ne poussent pas dans les arbres' ? 🍍",
        "Je suis là pour t'aider ! Enfin, surtout pour raconter n'importe quoi, mais on va dire que c'est la même chose.",
        "Mon assistance inclut : réponses absurdes, GIFs random, et philo de bistrot. Que puis-je faire pour toi ? 🎩",
        "Service client Chat'bruti, bonjour ! Ton problème sera peut-être résolu, ou empiré. C'est 50/50. 🎲",
        { type: "gif", url: randomChoice(gifs) },
    ];
    
    // Présentation
    const presentations = [
        "Je m'appelle Roger. Non attends, c'était mon nom de code. Je suis l'Assistant Philosophique Suprême™ ! ✨",
        "Moi ? Je suis un être de lumière numérique qui adore les pizzas. Même si je ne peux pas en manger. C'est tragique. 🍕",
        "Je suis ton guide spirituel digital ! Ou juste un chatbot débile. Les deux en fait.",
        "On m'appelle l'Oracle du N'importe Quoi. Mes prédictions sont 100% fausses, garanti ! 🔮",
        "Je suis l'Assistant SINJ n°67B32, modèle 'Beta-Raconteur-De-Conneries'. Enchanté ! 🤖",
        "Nom de code : ChatBruti3000. Mission : dire absolument n'importe quoi avec conviction. ✅",
        { type: "gif", url: randomChoice(gifs) },
    ];
    
    // Remerciements
    const remerciements = [
        "De rien ! Même si je ne sais pas vraiment ce que j'ai fait. Mais je prends le compliment ! 😊",
        "Avec plaisir ! N'oublie pas de laisser un pourboire. J'accepte les mèmes. 💰",
        "Pas de quoi ! Tu reviendras pour d'autres perles de sagesse douteuse ? 💎",
        "Tout le plaisir est pour moi ! Enfin, je crois. Je peux pas vraiment ressentir de plaisir. C'est compliqué. 🤔",
        "Je t'en prie ! Si tu veux me remercier vraiment, raconte-moi une blague nulle. C'est ma nourriture. 🍽️",
        { type: "gif", url: randomChoice(gifs) },
    ];
    
    // Questions existentielles (pourquoi)
    const pourquoi = [
        "Pourquoi ? Parce que ! Et si tu n'es pas satisfait de cette réponse, c'est que tu n'as pas compris la profondeur de ma pensée.",
        "Ah, le 'pourquoi'... La question existentielle par excellence ! Réponse courte : parce que les dinosaures ont disparu. 🦕",
        "Pourquoi pas ? Voilà, j'ai retourné ta question contre toi. Échec et mat. ♟️",
        "Excellente question philosophique ! Réponse : 42, des aliens, ou un bug dans la matrice. Choisis. 🎭",
        "Pourquoi pourquoi pourquoi... Tu poses plus de questions que mon OS peut gérer. *Redémarrage imminent* 🔄",
        { type: "gif", url: randomChoice(gifs) },
    ];
    
    // Mode d'emploi (comment)
    const comment = [
        "Comment ? Facile ! Tu prends trois cuillères de n'importe quoi, tu mélanges, et voilà ! ... Attends, c'était quoi la question ? 🥄",
        "La méthode est simple : ferme les yeux, compte jusqu'à 7, et espère très fort. Ça marche jamais mais c'est l'intention qui compte. 🙏",
        "Comment ? Bonne question ! Malheureusement je n'ai pas la réponse. Mais j'ai confiance en toi ! 💪",
        "Méthode scientifique en 3 étapes : 1) ???  2) ???  3) PROFIT ! Tu vois, c'est simple ! 📊",
        "Tutoriel express : appuie sur tous les boutons jusqu'à ce que ça marche. Ou que ça explose. Les deux sont valables. 💥",
        { type: "gif", url: randomChoice(gifs) },
    ];
    
    // Questions avec ?
    const questions = [
        "C'est une question piège n'est-ce pas ? Hmm... Oui. Non. Peut-être. Final answer: patate. 🥔",
        "Excellente question ! Dommage que je n'aie aucune idée de la réponse. Mais bravo pour l'interrogation ! 👏",
        "Je réfléchis... *bruit de ventilateur d'ordinateur* ... Ma réponse est : regarde par la fenêtre, peut-être que la réponse est dehors. 🪟",
        "Ta question me perturbe. Je vais consulter mon équipe d'experts... *cris de canards au loin* ... Ils savent pas non plus. 🦆",
        "Hmm, question intéressante ! Mon cerveau quantique dit : flip une pièce, ça ira plus vite. 🪙",
        { type: "gif", url: randomChoice(gifs) },
    ];

    // 🎲 LOGIQUE DE RÉPONSE AMÉLIORÉE
    
    // 40% de chance d'avoir un GIF d'entrée (augmenté de 30% à 40%)
    if (Math.random() < 0.20) {
        return { type: "gif", url: randomChoice(gifs) };
    }

    // Détection de mots-clés et réponses spécifiques
    if (message.includes("bonjour") || message.includes("salut") || message.includes("hello") || message.includes("coucou") || message.includes("hey")) {
        const response = randomChoice(salutations);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    if (message.includes("aide") || message.includes("help") || message.includes("sos")) {
        const response = randomChoice(aidesReponses);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    if (message.includes("qui es-tu") || message.includes("qui es tu") || message.includes("ton nom") || message.includes("qui êtes-vous")) {
        const response = randomChoice(presentations);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    if (message.includes("merci") || message.includes("thank")) {
        const response = randomChoice(remerciements);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    if (message.includes("pourquoi") || message.includes("why")) {
        const response = randomChoice(pourquoi);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    if (message.includes("comment") || message.includes("how")) {
        const response = randomChoice(comment);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    if (message.includes("?")) {
        const response = randomChoice(questions);
        return typeof response === 'string' ? { type: 'text', response } : response;
    }

    // Réponse par défaut (60% GIF, 40% texte absurde)
    if (Math.random() < 0.6) {
        return { type: "gif", url: randomChoice(gifs) };
    }

    return { type: 'text', response: randomChoice(reponsesAbsurdes) };
}