// public/script.js

const socket = io();

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");

function displayMessage(role, message) {
    const li = document.createElement("li");
    li.innerHTML = `
            <div class="mt-2 flex flex-col ${role === "user" ? "text-right" : ""}">
                <h3 class="text-sm font-medium">${role === "user" ? "You" : "Bot"}</h3>
                <p class="text-sm text-gray-500">${message}</p>
              </div>`;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
}

function loading() {
    const li = document.createElement("li");
    li.innerHTML = `<p id="loading">LOADING</p>`;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
}

function removeLoading() {
    document.getElementById("loading").remove();
    messages.scrollTop = messages.scrollHeight;
}

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = messageInput.value;
    displayMessage("user", message); // Display user's message in the chat
    loading();

    socket.emit("sendMessage", message, (error) => {
        if (error) {
            return alert(error);
        }

        messageInput.value = "";
        messageInput.focus();
    });
});

socket.on("message", (message) => {
    removeLoading();
    displayMessage("assistant", message); // Display assistant's message in the chat
});