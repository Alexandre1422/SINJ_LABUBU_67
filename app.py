# app.py (Code du serveur Flask)
from flask import Flask, request, jsonify

app = Flask(__name__)

# Logique de réponse du Chatbot
def get_chatbot_response(user_message):
    message = user_message.lower()
    
    # Règle de base pour la réponse
    if "bonjour" in message or "salut" in message:
        return "Bonjour ! Comment puis-je vous assister aujourd'hui ?"
    elif "aide" in message or "support" in message:
        return "Je peux vous aider avec les informations de contact ou les questions fréquentes."
    elif "heure" in message or "horaire" in message:
        return "Nous sommes ouverts de 9h à 17h."
    else:
        return "Je suis désolé, je ne comprends pas encore cette demande. Veuillez reformuler."

# Route pour l'API du Chatbot
@app.route('/api/chat', methods=['POST'])
def chat():
    # Récupérer les données JSON envoyées par le front-end
    data = request.get_json()
    user_message = data.get('message', '')
    
    # Obtenir la réponse
    bot_response = get_chatbot_response(user_message)
    
    # Renvoyer la réponse au front-end
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    # Lancez le serveur sur http://127.0.0.1:5000/
    app.run(debug=True)