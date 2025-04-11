// chat.js - With OpenAI integration
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    
    let conversationHistory = JSON.parse(localStorage.getItem('spiritChatHistory')) || [];
    
    // Initialize with welcome message if empty
    if (conversationHistory.length === 0) {
        addMessage('ai', "Hello! I'm Spirit, your AI assistant. How can I help you today?");
    } else {
        conversationHistory.forEach(msg => addMessage(msg.role, msg.content));
    }
    
    // Format messages with Markdown
    function formatMessage(text) {
        text = text.replace(/```(\w*)([\s\S]*?)```/g, '<pre><code class="$1">$2</code></pre>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        return text;
    }
    
    // Add message to chat
    function addMessage(role, content, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role === 'ai' ? 'ai' : 'user'}`;
        
        if (role === 'ai') {
            messageDiv.innerHTML = `
                <div class="ai-avatar">
                    <i class="ri-robot-2-line"></i>
                </div>
                <div class="message-bubble">
                    ${formatMessage(content)}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    ${formatMessage(content)}
                </div>
            `;
        }
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
        
        if (saveToHistory) {
            conversationHistory.push({ role, content });
            localStorage.setItem('spiritChatHistory', JSON.stringify(conversationHistory));
        }
    }
    
    // Get AI response from your proxy
    async function getAIResponse(userMessage) {
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...conversationHistory.map(msg => ({
                            role: msg.role === 'ai' ? 'assistant' : 'user',
                            content: msg.content
                        })),
                        { role: 'user', content: userMessage }
                    ]
                })
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.error('Error:', error);
            return "Sorry, I'm having trouble connecting to the AI service.";
        }
    }
    
    // Send message handler
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage('user', message);
        userInput.value = '';
        
        // Show typing indicator
        typingIndicator.style.display = 'flex';
        scrollToBottom();
        
        // Get AI response
        const aiResponse = await getAIResponse(message);
        
        // Hide typing and add response
        typingIndicator.style.display = 'none';
        addMessage('ai', aiResponse);
    }
    
    // UI Functions
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});