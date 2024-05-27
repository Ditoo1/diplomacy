const admin = require('firebase-admin');
const serviceAccount = require('./firebase/credenciales-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://democracy-a62c1-default-rtdb.firebaseio.com/" // URL de tu base de datos Firebase
});

const database = admin.database();

// Referencia a la colección de mensajes en la base de datos
const messagesRef = database.ref('messages');

// Función para enviar un mensaje
function sendMessage() {
    const messageInput = $('#message-input').val();
    if (messageInput !== '') {
        messagesRef.push({
            text: messageInput
        });
        $('#message-input').val('');
    }
}

// Muestra los mensajes en el chat
messagesRef.on('child_added', snapshot => {
    const message = snapshot.val();
    $('#chat-messages').append(`<li>${message.text}</li>`);
});

// Evento click del botón enviar
$('#send-button').click(sendMessage);

// Evento tecla Enter en el input para enviar el mensaje
$('#message-input').keypress(event => {
    if (event.which === 13) {
        sendMessage();
    }
});
