const conversationHistory = [];

function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, "0") + ":" +
           now.getMinutes().toString().padStart(2, "0");
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function scrollToBottom() {
    const chatBox = document.getElementById("messages");
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendUserMessage(text) {
    const chatBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "user-message";
    div.innerHTML = `
        <div class="message-text">${escapeHTML(text)}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}

function appendBotMessage(text) {
    const chatBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "bot-message";
    div.innerHTML = `
        <div class="message-text">${escapeHTML(text)}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}

function showTypingIndicator() {
    const chatBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "bot-message typing-indicator";
    div.id = "typing-indicator";
    div.innerHTML = `
        <div class="message-text">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;
    chatBox.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

// Calls YOUR proxy server — which talks to Ollama locally
async function fetchOllamaReply() {
    const response = await fetch("http://localhost:3000/api/chat",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || `Server error ${response.status}`);
    }

    return data.reply || "Sorry, I couldn't generate a response.";
}

function setInputState(disabled) {
    const input  = document.getElementById("message");
    const button = document.querySelector("button[onclick='sendMessage()']")
                || document.getElementById("send-btn");
    input.disabled = disabled;
    if (button) button.disabled = disabled;
}

async function sendMessage() {
    const input       = document.getElementById("message");
    const userMessage = input.value.trim();
    if (!userMessage) return;

    input.value = "";
    appendUserMessage(userMessage);
    conversationHistory.push({ role: "user", content: userMessage });

    showTypingIndicator();
    setInputState(true);

    try {
        const reply = await fetchOllamaReply();
        conversationHistory.push({ role: "assistant", content: reply });
        removeTypingIndicator();
        appendBotMessage(reply);
    } catch (error) {
        console.error("AI HUB chat error:", error);
        removeTypingIndicator();
        appendBotMessage("⚠️ " + error.message);
    } finally {
        setInputState(false);
        input.focus();
    }
}

document.getElementById("message").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});