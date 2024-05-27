var loggedIn1 = false;

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlsQG83ex1dYXtB3R2QBIJb9P8ETIJSw4",
  authDomain: "democracy-38111.firebaseapp.com",
  projectId: "democracy-38111",
  storageBucket: "democracy-38111.appspot.com",
  messagingSenderId: "984820517620",
  appId: "1:984820517620:web:7480828e3e091524272ca1",
  measurementId: "G-N8YW6X7J37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

document.querySelectorAll(".user-input").forEach(function(textarea) {
  textarea.style.display = "none"; // Ocultar todas las áreas de entrada inicialmente
});

document.querySelectorAll(".send-btn").forEach(function(button) {
  button.style.display = "none"; // Ocultar todos los botones de enviar inicialmente
});

document.getElementById("loginBtn").addEventListener("click", function() {
  var password = prompt("Introduce la contraseña:");
  switch (password) {
    case "contraseña1":
      loggedIn1 = true;
      toggleChatUI(loggedIn1, 1);
      break;
    default:
      alert("Contraseña incorrecta. Intenta de nuevo.");
  }
});

function toggleChatUI(loggedIn, chatNumber) {
  var userInput = document.getElementById("userInput" + chatNumber);
  var sendBtn = document.getElementById("sendBtn" + chatNumber);

  if (loggedIn) {
    userInput.style.display = "block"; // Mostrar el área de entrada al iniciar sesión
    sendBtn.style.display = "block"; // Mostrar el botón de enviar al iniciar sesión
    userInput.removeAttribute("readonly"); // Permitir la escritura en el área de entrada
    sendBtn.disabled = false; // Habilitar el botón de enviar
  } else {
    userInput.style.display = "none"; // Ocultar el área de entrada si no ha iniciado sesión
    sendBtn.style.display = "none"; // Ocultar el botón de enviar si no ha iniciado sesión
    userInput.setAttribute("readonly", true); // Hacer el área de entrada de solo lectura
    sendBtn.disabled = true; // Deshabilitar el botón de enviar
  }
}

function sendMessage(chatNumber) {
  var userInput = document.getElementById("userInput" + chatNumber);
  var message = userInput.value;
  if (message.trim() !== "") {
    firebase.firestore().collection("chats").doc("chat" + chatNumber).collection("messages").add({
      message: message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function(docRef) {
      console.log("Mensaje enviado con ID: ", docRef.id);
      userInput.value = ""; // Limpiar el área de entrada después de enviar el mensaje
    })
    .catch(function(error) {
      console.error("Error al enviar mensaje: ", error);
    });
  }
}

