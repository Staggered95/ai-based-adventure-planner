// Store chat history
let chatHistory = [];
let currentChatId = generateChatId();

// DOM elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistoryContainer = document.getElementById('chat-history');

// Function to generate a unique chat ID
function generateChatId() {
    return 'chat_' + Date.now();
}

// Initialize the chat
function initChat() {
    // Load chat history from localStorage
    loadChatHistory();
    displayChatHistory();
    
    // Set up event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    newChatBtn.addEventListener('click', startNewChat);
}

// Load chat history from localStorage
function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Display chat history in sidebar
function displayChatHistory() {
    chatHistoryContainer.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const chatItem = document.createElement('a');
        chatItem.href = '#';
        chatItem.className = 'group flex items-center px-3 py-2 text-sm font-medium rounded-md ' + 
                            (chat.id === currentChatId ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white');
        chatItem.innerHTML = `
            <i class="fas fa-comment mr-3"></i>
            <span class="truncate">${chat.title}</span>
        `;
        chatItem.addEventListener('click', function(e) {
            e.preventDefault();
            loadChat(chat.id);
        });
        
        chatHistoryContainer.appendChild(chatItem);
    });
}

// Load a specific chat
function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
        currentChatId = chatId;
        displayChatHistory();
        
        // Display messages
        chatMessages.innerHTML = '';
        
        // Add welcome message
        addAiMessage("Hello! I'm your AI assistant. How can I help you today?");
        
        // Add chat messages
        chat.messages.forEach(msg => {
            if (msg.sender === 'user') {
                addUserMessage(msg.text);
            } else {
                addAiMessage(msg.text);
            }
        });
        
        // Scroll to bottom
        scrollToBottom();
    }
}

// Start a new chat
function startNewChat() {
    currentChatId = generateChatId();
    
    // Add new chat to history
    chatHistory.unshift({
        id: currentChatId,
        title: "New Conversation",
        messages: []
    });
    
    saveChatHistory();
    displayChatHistory();
    
    // Clear messages
    chatMessages.innerHTML = '';
    addAiMessage("Hello! I'm your AI assistant. How can I help you today?");
}

// Send message to AI
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    
    // Display user message
    addUserMessage(message);
    
    // Add message to current chat
    const currentChat = chatHistory.find(c => c.id === currentChatId);
    if (currentChat) {
        currentChat.messages.push({
            sender: 'user',
            text: message
        });
        
        // Update chat title if this is the first message
        if (currentChat.messages.length === 1) {
            currentChat.title = message.length > 20 ? message.substring(0, 20) + '...' : message;
            displayChatHistory();
        }
        
        saveChatHistory();
    }
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Send to backend
        const response = await sendToBackend(message);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Display AI response
        addAiMessage(response);
        
        // Add response to chat history
        if (currentChat) {
            currentChat.messages.push({
                sender: 'ai',
                text: response
            });
            
            saveChatHistory();
        }
    } catch (error) {
        // Remove typing indicator
        typingIndicator.remove();
        
        // Display error message
        addAiMessage("Sorry, I couldn't process your request. Please try again.");
        console.error("Error:", error);
    }
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex typing-indicator';
    typingDiv.innerHTML = `
        <div class="flex-shrink-0 mr-4">
            <span class="h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center">
                <i class="fas fa-robot text-white"></i>
            </span>
        </div>
        <div class="flex-1 bg-black rounded-lg p-4 max-w-3xl">
            <div class="flex space-x-2">
                <div class="dot-typing"></div>
                <div class="dot-typing animation-delay-200"></div>
                <div class="dot-typing animation-delay-400"></div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    
    return typingDiv;
}

// Add user message to chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex justify-end';
    messageDiv.innerHTML = `
        <div class="flex-1 bg-black shadow-lg shadow-green-400/80 ring-1 ring-green-500/50 ring-offset-2 ring-offset-gray-900 rounded-lg p-4 max-w-5xl ml-auto">
            <p class="text-lg text-gray-100">${escapeHtml(message)}</p>
        </div>
        <div class="flex-shrink-0 ml-4">
            <span class="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center">
                <i class="fas fa-user text-white"></i>
            </span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add AI message to chat
function addAiMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex my-16 justify-center';
    messageDiv.innerHTML = `
        <div class="flex-shrink-0 mr-4">
            <span class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <i class="fas fa-robot text-white"></i>
            </span>
        </div>
        <div class="flex-1 bg-black shadow-lg shadow-green-400/80 ring-1 ring-green-500/50 rounded-lg p-4 max-w-full">
            <div class="w-full bg-[#0D1117] p-4 rounded-xl shadow-lg">
            <div class="markdown-body">${marked.parse(message)}</div>
            </div>

            <div class="mt-3 flex justify-end space-x-2">
                <button class="text-gray-200 hover:text-gray-400" onclick="copyMessage(this)">
                    <i class="far fa-copy"></i>
                </button>
                <button class="text-gray-200 hover:text-gray-400">
                    <i class="far fa-thumbs-up"></i>
                </button>
                <button class="text-gray-200 hover:text-gray-400">
                    <i class="far fa-thumbs-down"></i>
                </button>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Send message to backend
async function sendToBackend(message) {
    // Replace this URL with your actual backend endpoint
    const backendUrl = 'http://localhost:3000/chat';
    
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                chatId: currentChatId
            })
        });
        
        if (!response.ok) {
            throw new Error('Backend request failed');
        }
        
        const data = await response.json();
        return data.message;

    } catch (error) {
        console.error("Error sending to backend:", error);
        throw error;
    }
}

// Format message with basic markdown
function formatMessage(message) {
    message = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$1</a>');
    
    // Replace newlines with <br>
    message = message.replace(/\n/g, '<br>');
    
    return message;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy message text
function copyMessage(button) {
    const messageText = button.closest('.flex-1').querySelector('p').textContent;
    navigator.clipboard.writeText(messageText).then(() => {
        // Show copied feedback
        const icon = button.querySelector('i');
        icon.className = 'fas fa-check';
        setTimeout(() => {
            icon.className = 'far fa-copy';
        }, 2000);
    });
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize when page loads
function loadIndex() {
    const firstMessage = localStorage.getItem("initialBotResponse");
    if (firstMessage) {
        addAiMessage(firstMessage);  
        localStorage.removeItem("initialBotResponse");
    }
}
//document.addEventListener('DOMContentLoaded', initChat);
window.addEventListener("DOMContentLoaded", () => {
    initChat();
    loadIndex();
});

// Add some CSS for the typing indicator
const style = document.createElement('style');
style.textContent = `
    .dot-typing {
        position: relative;
        width: 6px;
        height: 6px;
        border-radius: 5px;
        background-color: #28a152;
        color: #28a152;
        animation: dot-typing 1.5s infinite linear;
    }
    
    .animation-delay-200 {
        animation-delay: 0.2s;
    }
    
    .animation-delay-400 {
        animation-delay: 0.4s;
    }
    
    @keyframes dot-typing {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    .markdown-body * {
    font-size: 1.25rem !important; /* ~text-xl */
    background-color: transparent !important;
    color: #f1f5f9 !important;
    }
    `;
    document.head.appendChild(style);