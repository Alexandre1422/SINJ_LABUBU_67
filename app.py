# app.py (Code du serveur Flask)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Logique de réponse du Chatbot - Version "Chat'bruti" 🤪
import random

def get_chatbot_response(user_message):
    message = user_message.lower()
    
    # Liste de GIFs Giphy (tu peux en ajouter d'autres)
    gifs = [
        "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",  # Confused
        "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",  # Thinking
        "https://media.giphy.com/media/xUPGcz2H1TXdCz4suY/giphy.gif",  # Mind blown
        "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif",  # What?
        "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",  # Shrug
        "https://media.giphy.com/media/ToMjGpnXBTw7vnokxhu/giphy.gif",  # Dancing
        "https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif",  # Facepalm
        "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",  # Screaming
        "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",  # What is this
        "https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif",  # Confused math
    ]
    
    # Réponses complètement à côté de la plaque (texte)
    reponses_absurdes = [
        "Intéressante question ! Savais-tu que les pingouins ne peuvent pas voler parce qu'ils ont peur des nuages ? 🐧",
        "Hmm, laisse-moi réfléchir... *réfléchit intensément* ... J'ai oublié la question. C'était quoi déjà ?",
        "EUREKA ! La réponse est 42. Ou peut-être 43. Attends, c'était quoi la question déjà ? 🤔",
        "Excellente observation ! Mais as-tu déjà pensé au fait que les chaussettes disparaissent dans la machine à laver pour rejoindre une dimension parallèle ?",
        "Tu soulèves un point fascinant ! D'ailleurs, selon mes calculs, les licornes sont juste des chevaux qui ont réussi leur examen de magie. 🦄",
        "Ah ! Je connais la réponse ! C'est... *bruit de connexion internet* ... Désolé, j'ai perdu le fil de mes pensées dans un trou noir.",
        "Question pertinente ! Savais-tu que si tu mets un croissant dans l'espace, il devient automatiquement français ? 🥐",
        "Mmh oui, absolument ! Enfin non. Peut-être ? En fait je ne sais pas, mais j'ai l'air confiant en le disant !",
        "Ta question me rappelle cette fois où j'ai essayé de compter jusqu'à l'infini. J'en suis à 3. C'est long.",
        "Fascinant ! Mais la vraie question est : pourquoi les flamants roses ne sont-ils pas bleus ? 🦩",
        "J'ai consulté mes archives quantiques et... oh attends, ce sont juste des mèmes de chats. 🐱",
        "Selon mes sources (Wikipedia, mais la page d'accueil), la réponse est peut-être dans ton cœur. Ou dans ton frigo.",
        "Bonne question ! Malheureusement, j'étais en train de philosopher sur l'existence des nuggets quand tu as parlé.",
        "Tu vois, c'est exactement comme disait Shakespeare : 'Être ou ne pas être... un sandwich.' Je crois. 🥪",
        "ATTENTION RÉVÉLATION : Les nuages sont en fait de la barbe à papa géante. Ne me remercie pas pour cette vérité.",
    ]
    
    # Décision aléatoire : GIF ou texte ? (30% de chance d'avoir un GIF)
    if random.random() < 0.3:
        return {"type": "gif", "url": random.choice(gifs)}
    
    # Réponses spécifiques pour certains mots-clés (toujours absurdes)
    if "bonjour" in message or "salut" in message or "hello" in message:
        return random.choice([
            "Bonsoir ! Attends non... Bon après-midi ? Quelle heure est-il sur Mars déjà ? 🚀",
            "Salutations terrien ! Ou terrienne. Ou alien déguisé. Je ne juge pas. 👽",
            "Yo ! Enfin non, ça c'est pas assez philosophique. BONJOUR, Ô NOBLE VISITEUR ! Voilà, c'est mieux.",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    elif "aide" in message or "help" in message:
        return random.choice([
            "Bien sûr que je peux t'aider ! Pour quoi faire ? Aucune idée, mais je suis très motivé ! 💪",
            "Aide ? Tu veux dire comme dans 'aide-moi à comprendre pourquoi les ananas ne poussent pas dans les arbres' ?",
            "Je suis là pour t'aider ! Enfin, surtout pour raconter n'importe quoi, mais on va dire que c'est la même chose.",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    elif "qui es-tu" in message or "qui es tu" in message or "ton nom" in message:
        return random.choice([
            "Je m'appelle Roger. Non attends, c'était mon nom de code. Je suis l'Assistant Philosophique Suprême™ ! ✨",
            "Moi ? Je suis un être de lumière numérique qui adore les pizzas. Même si je ne peux pas en manger. C'est tragique. 🍕",
            "Je suis ton guide spirituel digital ! Ou juste un chatbot débile. Les deux en fait.",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    elif "merci" in message or "thank" in message:
        return random.choice([
            "De rien ! Même si je ne sais pas vraiment ce que j'ai fait. Mais je prends le compliment ! 😊",
            "Avec plaisir ! N'oublie pas de laisser un pourboire. J'accepte les mèmes.",
            "Pas de quoi ! Tu reviendras pour d'autres perles de sagesse douteuse ?",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    elif "?" in message:
        return random.choice([
            "C'est une question piège n'est-ce pas ? Hmm... Oui. Non. Peut-être. Final answer: patate. 🥔",
            "Excellente question ! Dommage que je n'aie aucune idée de la réponse. Mais bravo pour l'interrogation !",
            "Je réfléchis... *bruit de ventilateur d'ordinateur* ... Ma réponse est : regarde par la fenêtre, peut-être que la réponse est dehors.",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    elif "pourquoi" in message or "why" in message:
        return random.choice([
            "Pourquoi ? Parce que ! Et si tu n'es pas satisfait de cette réponse, c'est que tu n'as pas compris la profondeur de ma pensée.",
            "Ah, le 'pourquoi'... La question existentielle par excellence ! Réponse courte : parce que les dinosaures ont disparu.",
            "Pourquoi pas ? Voilà, j'ai retourné ta question contre toi. Échec et mat. ♟️",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    elif "comment" in message or "how" in message:
        return random.choice([
            "Comment ? Facile ! Tu prends trois cuillères de n'importe quoi, tu mélanges, et voilà ! ... Attends, c'était quoi la question ?",
            "La méthode est simple : ferme les yeux, compte jusqu'à 7, et espère très fort. Ça marche jamais mais c'est l'intention qui compte.",
            "Comment ? Bonne question ! Malheureusement je n'ai pas la réponse. Mais j'ai confiance en toi ! 💪",
            {"type": "gif", "url": random.choice(gifs)},
        ])
    
    else:
        # 50% de chance d'avoir un GIF dans les réponses aléatoires
        if random.random() < 0.5:
            return {"type": "gif", "url": random.choice(gifs)}
        return random.choice(reponses_absurdes)

# Route pour servir le HTML
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Route pour servir les fichiers CSS/JS/images
@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

# Route pour l'API du Chatbot
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    bot_response = get_chatbot_response(user_message)
    
    # Si c'est un GIF, renvoyer le format spécial
    if isinstance(bot_response, dict) and bot_response.get('type') == 'gif':
        return jsonify({
            'type': 'gif',
            'url': bot_response['url']
        })
    
    # Sinon, renvoyer du texte normal
    return jsonify({
        'type': 'text',
        'response': bot_response
    })

if __name__ == '__main__':
    print("🚀 Serveur lancé sur http://127.0.0.1:5000")
    print("📱 Ouvre ton navigateur et va sur: http://127.0.0.1:5000")
    app.run(debug=True)