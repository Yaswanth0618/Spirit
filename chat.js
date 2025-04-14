document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');

    // Voice to Text Button
    const voiceButton = document.createElement('button');
    voiceButton.innerText = '🎙️';
    voiceButton.id = 'voiceButton';
    voiceButton.title = 'Speak your message';
    voiceButton.style.marginLeft = '8px';
    sendButton.parentNode.insertBefore(voiceButton, sendButton.nextSibling);

    let conversationHistory = JSON.parse(localStorage.getItem('spiritChatHistory')) || [];
    let moodState = "neutral";

    // Initial greeting
    if (conversationHistory.length === 0) {
        addMessage('ai', "👋 Hey there! I'm Spirit AI — your personal productivity time traveler. What are we focusing on today?");
    } else {
        conversationHistory.forEach(msg => addMessage(msg.role, msg.content));
    }

    // Clean formatter for AI output
    function formatMessage(text) {
        let formatted = text
            .replace(/[*_~`#>]+/g, '')                             // remove markdown
            .replace(/\n{2,}/g, '</p><p>')                         // double newline = new paragraph
            .replace(/\n/g, '<br>')                                // single newline = line break
            .replace(/```(\w*)\n?([\s\S]+?)```/g, '<pre><code>$2</code></pre>')  // code blocks
            .replace(/`([^`]+)`/g, '<code>$1</code>');             // inline code
        return `<p>${formatted}</p>`;
    }

    function addMessage(role, content, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role === 'ai' ? 'ai' : 'user'}`;
        messageDiv.innerHTML = role === 'ai'
            ? `<div class="ai-avatar"><i class="ri-robot-2-line"></i></div><div class="message-bubble">${formatMessage(content)}</div>`
            : `<div class="message-bubble">${formatMessage(content)}</div>`;

        chatContainer.appendChild(messageDiv);
        scrollToBottom();

        if (saveToHistory) {
            conversationHistory.push({ role, content });
            localStorage.setItem('spiritChatHistory', JSON.stringify(conversationHistory));
        }
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function detectSimulationPrompt(input) {
        const triggers = ["what if i", "skip", "miss", "delay", "postpone"];
        return triggers.some(trigger => input.toLowerCase().includes(trigger));
    }

    function detectMood(input) {
        const text = input.toLowerCase();
        if (text.includes("burned out") || text.includes("exhausted") || text.includes("tired")) return "tired";
        if (text.includes("stressed") || text.includes("pressure")) return "stressed";
        if (text.includes("great") || text.includes("excited")) return "motivated";
        if (text.includes("sad") || text.includes("lazy")) return "low";
        return "neutral";
    }

    async function getAIResponse(userMessage) {
        const isSimulated = detectSimulationPrompt(userMessage);
        moodState = detectMood(userMessage);

        let systemPrompt = "";

        if (isSimulated) {
            systemPrompt = `
You are Spirit AI, a futuristic assistant. Simulate the outcome of missed or skipped tasks using a cascading chain of consequences (ChronoLoop Simulation). Be realistic, engaging, and use emoji sparingly for emotional impact.
Example: "You skip math ➝ wake late ➝ feel rushed ➝ miss breakfast ➝ can’t focus ➝ backlog piles up."
            `.trim();
        } else {
            systemPrompt = `
You are Spirit AI — a smart, emotionally aware productivity assistant. The user's current mood is "${moodState}". Based on that, respond with empathy and either encouragement or relief. If they seem demotivated, suggest a lighter alternative. If they’re overconfident, balance with realism.
            `.trim();
        }

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: systemPrompt,
                    messages: [
                        ...conversationHistory.map(msg => ({
                            role: msg.role === 'ai' ? 'assistant' : 'user',
                            content: msg.content
                        })),
                        { role: 'user', content: userMessage }
                    ]
                })
            });

            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            return data.response;

        } catch (err) {
            console.error(err);
            return "⚠️ I couldn’t connect to my futuristic servers. Try again soon!";
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        userInput.value = '';
        typingIndicator.style.display = 'flex';
        scrollToBottom();

        const aiReply = await getAIResponse(message);
        typingIndicator.style.display = 'none';
        addMessage('ai', aiReply);
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    voiceButton.addEventListener('click', () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser doesn’t support voice recognition.');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            voiceButton.innerText = '🎤...';
        };

        recognition.onerror = () => {
            voiceButton.innerText = '🎙️';
        };

        recognition.onend = () => {
            voiceButton.innerText = '🎙️';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };

        recognition.start();
    });
});
