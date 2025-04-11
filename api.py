from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key="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")

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=messages
        )
        
        return jsonify({
            "response": response.choices[0].message.content
        })
    
    except Exception as e:
        print("Error:", e)  # Debugging
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)  # Debug mode for troubleshooting