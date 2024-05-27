// Importar la librería de cifrado
const CryptoJS = require("crypto-js");

const firebaseConfig = {
    apiKey: "AIzaSyC643BZysfS-TkAo5sUhmRREwE9MurGoD8",
    authDomain: "democracy-a62c1.firebaseapp.com",
    databaseURL: "https://democracy-a62c1-default-rtdb.firebaseio.com",
    projectId: "democracy-a62c1",
    storageBucket: "democracy-a62c1.appspot.com",
    messagingSenderId: "1092075734405",
    appId: "1:1092075734405:web:f8c9320c60104acc8370ec"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencia a la base de datos
const db = firebase.database();

// Clave secreta para el cifrado simétrico (asegúrate de mantenerla segura)
const secretKey = "miClaveSecreta123";

// Función para cifrar un mensaje
function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

// Función para descifrar un mensaje
function decryptMessage(encryptedMessage) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Obtener el nombre de usuario
const username = prompt("Ingrese su nombre de usuario:");

// Enviar mensaje cifrado a la base de datos
function sendMessage(e) {
  e.preventDefault();

  const timestamp = Date.now();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;

  // Cifrar el mensaje antes de enviarlo a la base de datos
  const encryptedMessage = encryptMessage(message);

  messageInput.value = "";

  document
    .getElementById("messages")
    .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

  db.ref("messages/" + timestamp).set({
    username,
    message: encryptedMessage // Se guarda el mensaje cifrado en la base de datos
  });
}

// Mostrar mensajes descifrados
const fetchChat = db.ref("messages/");
fetchChat.on("child_added", function(snapshot) {
  const messages = snapshot.val();
  const decryptedMessage = decryptMessage(messages.message); // Descifrar el mensaje
  const message = `<li class=${username === messages.username ? "sent" : "receive"}><span>${messages.username}: </span>${decryptedMessage}</li>`;
  document.getElementById("messages").innerHTML += message;
});

// Escuchar el evento submit del formulario para enviar mensajes
document.getElementById("message-form").addEventListener("submit", sendMessage);