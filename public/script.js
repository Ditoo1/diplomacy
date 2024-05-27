// Initialize Firebase
const firebaseConfig = {
    // Coloca aquí tus credenciales de Firebase
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    if (message !== '') {
        database.ref('messages').push({
            text: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        messageInput.value = '';
    }
}

// Function to display messages
function displayMessages() {
    const chatBox = document.getElementById('chat-box');
    database.ref('messages').on('value', function(snapshot) {
        chatBox.innerHTML = '';
        snapshot.forEach(function(childSnapshot) {
            const message = childSnapshot.val().text;
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            chatBox.appendChild(messageElement);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Display messages when the page loads
window.onload = function() {
    displayMessages();
};
