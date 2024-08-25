// Configuración de Firebase (reemplaza con tus propias credenciales)
const firebaseConfig = {
    apiKey: "AIzaSyBFtJWTdqfS0MXCwWzFrHZNoqaCpHKXoC0",
    authDomain: "chat-fcc15.firebaseapp.com",
    databaseURL: "https://chat-fcc15-default-rtdb.firebaseio.com",
    projectId: "chat-fcc15",
    storageBucket: "chat-fcc15.appspot.com",
    messagingSenderId: "349866955859",
    appId: "1:349866955859:web:c166c2f9dd4a4aed01a2a6"
  };
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos
const database = firebase.database();

// Elementos del DOM
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const usersList = document.getElementById('users-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let currentUser = null;
let messagesRef;
let usersRef;

// Función para cargar el nombre de usuario guardado y iniciar sesión automáticamente
function loadSavedUser() {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
        login(savedUsername);
    }
}

// Llamar a esta función cuando la página se carga
window.onload = loadSavedUser;

// Función para iniciar sesión
function login(username) {
    username = username || usernameInput.value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('chatUsername', username);
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        database.ref('users/' + username).set(true);
        setupListeners();
    }
}

// Función para cerrar sesión
function logout() {
    if (currentUser) {
        database.ref('users/' + currentUser).remove();
        currentUser = null;
        localStorage.removeItem('chatUsername');
        chatContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        usernameInput.value = '';
        removeListeners();
        chatMessages.innerHTML = '';
        usersList.innerHTML = '';
    }
}

// Función para configurar los listeners
function setupListeners() {
    messagesRef = database.ref('messages');
    usersRef = database.ref('users');
    
    messagesRef.on('child_added', addMessage);
    usersRef.on('value', updateUsers);
}

// Función para remover los listeners
function removeListeners() {
    if (messagesRef) {
        messagesRef.off('child_added', addMessage);
    }
    if (usersRef) {
        usersRef.off('value', updateUsers);
    }
}

// Función para actualizar la lista de usuarios
function updateUsers(snapshot) {
    usersList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.key;
        const userElement = document.createElement('div');
        userElement.textContent = user;
        usersList.appendChild(userElement);
    });
}

// Función para añadir un mensaje al chat
function addMessage(snapshot) {
    const message = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.sender === currentUser ? 'sent' : 'received');
    messageElement.textContent = `${message.sender}: ${message.text}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para enviar mensajes
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '' && currentUser) {
        database.ref('messages').push({
            text: message,
            sender: currentUser,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        messageInput.value = '';
    }
}

// Eventos
loginButton.addEventListener('click', () => login());
logoutButton.addEventListener('click', logout);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});