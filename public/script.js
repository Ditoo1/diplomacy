// script.js
document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = require('./firebase-service-account.json');
    const firebase = require('firebase/app');
    require('firebase/database');

    firebase.initializeApp(firebaseConfig);

    const messagesRef = firebase.database().ref('messages');
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    const messagesList = document.getElementById('messages');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita la recarga de la página
        const message = input.value;
        messagesRef.push().set({
            text: message
        });
        input.value = '';
    });

    messagesRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        const div = document.createElement('div');
        div.textContent = message.text;
        messagesList.appendChild(div);
    });
});
