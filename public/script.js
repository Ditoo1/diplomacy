// Firebase Config (reemplaza con tus datos)
const firebaseConfig = {
    apiKey: "AIzaSyCT6NTghTAmIKMbBV6j8a8jQpG_0p9j3MU",
    authDomain: "nichat-ac9af.firebaseapp.com",
    databaseURL: "https://nichat-ac9af-default-rtdb.firebaseio.com",
    projectId: "nichat-ac9af",
    storageBucket: "nichat-ac9af.firebasestorage.app",
    messagingSenderId: "1054450055173",
    appId: "1:1054450055173:web:dba2ca2c9e3385997ec46c",
    measurementId: "G-7NFNW6GDLX"
  };

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Elementos del DOM
const chatContainer = document.querySelector('.chat-container');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const logoutButton = document.getElementById('logout');
const toggleThemeButton = document.getElementById('toggle-theme');
const usernameModal = document.getElementById('username-modal');
const modalUsernameInput = document.getElementById('modal-username-input');
const modalSubmitButton = document.getElementById('modal-submit');

// Estado
let username = localStorage.getItem('chat-username');

// Tema automático (detecta preferencia del sistema)
function applySystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('light-mode', !prefersDark);
}

// Cargar tema guardado o aplicar sistema
function initTheme() {
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
        document.body.classList.toggle('light-mode', savedTheme === 'light');
    } else {
        applySystemTheme();
    }
}

// Cambiar tema manual
toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem(
        'chat-theme',
        document.body.classList.contains('light-mode') ? 'light' : 'dark'
    );
});

// Cerrar sesión
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('chat-username');
    window.location.reload();
});

// Inicializar modal si no hay nombre
if (!username) {
    usernameModal.style.display = 'flex';
    chatContainer.style.display = 'none';
} else {
    usernameModal.style.display = 'none';
    chatContainer.style.display = 'flex';
}

// Guardar nombre desde modal
modalSubmitButton.addEventListener('click', () => {
    username = modalUsernameInput.value.trim();
    if (username) {
        localStorage.setItem('chat-username', username);
        usernameModal.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
});

// Enviar mensaje
function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    database.ref('messages').push({
        sender: username,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        processed: false
    });

    userInput.value = '';
}

// Escuchar mensajes
database.ref('messages').orderByChild('timestamp').limitToLast(100).on('child_added', (snapshot) => {
    const msg = snapshot.val();
    appendMessage(msg.sender, msg.text, msg.sender === username ? 'user-message' : 'bot-message');
});

// Mostrar mensajes
function appendMessage(sender, text, className) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message', className);
    msgElement.innerHTML = `
        <div class="message-sender">${sender}</div>
        <div class="message-text">${text}</div>
    `;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Eventos
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Iniciar
initTheme();