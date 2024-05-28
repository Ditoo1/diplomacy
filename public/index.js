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
// Inicializar Firebase
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar la base de datos
const db = firebase.database();

// Enviar mensaje o imagen
document.getElementById("message-form").addEventListener("submit", sendMessage);

// Obtener datos del usuario
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Por favor, introduce tu nombre chistosín:");
  localStorage.setItem("username", username);
  addUserToActiveList(username); // Agregar usuario a la lista de usuarios activos
}

// Validar que el nombre no esté vacío
while (!username.trim()) {
  username = prompt("¡Ups! Parece que no ingresaste un nombre. Por favor, introduce tu nombre chistosín:");
  localStorage.setItem("username", username);
}

// Función para detectar cuando el usuario está activo en la ventana del chat
function detectUserActivity() {
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'visible') {
      addUserToActiveList(username);
    } else {
      removeUserFromActiveList(username);
    }
  });
}

// Función para agregar usuario a la lista de usuarios activos
function addUserToActiveList(username) {
  const userRef = db.ref("presence/" + username);
  userRef.set(true); // Utiliza el nombre de usuario como clave y establece su estado como activo

  // Eliminar el registro de presencia del usuario al cerrar la ventana
  userRef.onDisconnect().remove();
}

// Función para eliminar usuario de la lista de usuarios activos
function removeUserFromActiveList(username) {
  const userRef = db.ref("presence/" + username);
  userRef.remove();
}

// Actualizar los usuarios activos en la lista
const activeUsersRef = db.ref("presence");

activeUsersRef.on("value", function(snapshot) {
  const activeUsersList = document.getElementById("active-users");
  activeUsersList.innerHTML = ""; // Limpiar la lista antes de agregar usuarios
  
  snapshot.forEach(function(childSnapshot) {
    const username = childSnapshot.key; // Obtener el nombre de usuario desde la clave
    const listItem = document.createElement("li");
    listItem.textContent = username;
    activeUsersList.appendChild(listItem);
  });
});

// Función para enviar mensaje o imagen
function sendMessage(e) {
  e.preventDefault();
  
  // Obtener valores a enviar
  const timestamp = Date.now();
  const messageInput = document.getElementById("message-input");
  const imageUrlInput = document.getElementById("image-url-input");
  const message = messageInput.value;
  const imageUrl = imageUrlInput.value;
  
  // Limpiar los campos de entrada
  messageInput.value = "";
  imageUrlInput.value = "";
  
  // Obtener la hora actual en formato de Santiago
  const options = { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' };
  const now = new Date();
  const timeString = new Intl.DateTimeFormat('es-CL', options).format(now);
  
  // Enviar el mensaje a la base de datos
  const newMessage = {
    username,
    timestamp,
    timeString,
    message: message.trim() !== "" ? message : null,
    imageUrl: imageUrl.trim() !== "" ? imageUrl : null
  };
  
  db.ref("messages/" + timestamp).set(newMessage).then(() => {
    scrollToBottom();
  });
}

// Función para mostrar los mensajes con la hora
db.ref("messages").on("child_added", function(snapshot) {
  const message = snapshot.val();
  const messagesList = document.getElementById("messages");
  const listItem = document.createElement("li");
  
  let content = `<strong>${message.username}</strong>: `;
  
  if (message.imageUrl) {
    content += `<img src="${message.imageUrl}" alt="Imagen">`;
  } else {
    content += message.message;
  }
  
  content += `<span class="message-time">${message.timeString}</span>`;
  
  listItem.innerHTML = content;
  messagesList.appendChild(listItem);
  scrollToBottom();
});

// Función para desplazarse automáticamente al último mensaje
function scrollToBottom() {
  const messagesList = document.getElementById("messages");
  messagesList.scrollTop = messagesList.scrollHeight;
}

// Función para mostrar la hora de Santiago de Chile
function updateSantiagoTime() {
  const santiagoTimeElement = document.getElementById('santiago-time');
  const options = { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  setInterval(() => {
    const now = new Date();
    const timeString = new Intl.DateTimeFormat('es-CL', options).format(now);
    santiagoTimeElement.textContent = `Hora de Santiago: ${timeString}`;
  }, 1000);
}

// Llamar a las funciones para detectar la actividad del usuario y actualizar la hora de Santiago
detectUserActivity();
updateSantiagoTime();
