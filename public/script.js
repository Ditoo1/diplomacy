// public/script.js

const socket = io({ query: { userId: 'ID_DE_USUARIO' } });

const messages = document.getElementById('messages');
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');

// Cargar mensajes anteriores
socket.on('load messages', (msgs) => {
    for (const id in msgs) {
        displayMessage(msgs[id]);
    }
});

// Mostrar nuevo mensaje
socket.on('new message', (msg) => {
    displayMessage(msg);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value;
    socket.emit('send message', message);
    input.value = '';
});

function displayMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
