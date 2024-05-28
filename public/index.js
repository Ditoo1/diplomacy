const firebaseConfig = {
    apiKey: "AIzaSyC643BZysfS-TkAo5sUhmRREwE9MurGoD8",
    authDomain: "democracy-a62c1.firebaseapp.com",
    databaseURL: "https://democracy-a62c1-default-rtdb.firebaseio.com",
    projectId: "democracy-a62c1",
    storageBucket: "democracy-a62c1.appspot.com",
    messagingSenderId: "1092075734405",
    appId: "1:1092075734405:web:f8c9320c60104acc8370ec"
  };


  firebase.initializeApp(firebaseConfig);

  // inicializar la base de datos
  const db = firebase.database();
    
  // obtener datos del usuario
  let username = localStorage.getItem("username");
  if (!username) {
    username = prompt("Por favor, introduce tu nombre chistosín:");
    localStorage.setItem("username", username);
  }
  
  // validar que el nombre no esté vacío
  while (!username.trim()) {
    username = prompt("¡Ups! Parece que no ingresaste un nombre. Por favor, introduce tu nombre chistosín:");
    localStorage.setItem("username", username);
  }
  
  // enviar mensaje o imagen
  document.getElementById("message-form").addEventListener("submit", sendMessage);
  
  function sendMessage(e) {
    e.preventDefault();
  
    // obtener valores a enviar
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const imageUrlInput = document.getElementById("image-url-input");
    const message = messageInput.value;
    const imageUrl = imageUrlInput.value;
  
    // limpiar los campos de entrada
    messageInput.value = "";
    imageUrlInput.value = "";
  
    // auto desplazarse hacia abajo
    document
      .getElementById("messages")
      .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  
    // enviar el mensaje a la base de datos
    if (imageUrl.trim() !== "") {
      // si hay una URL de imagen, enviar un mensaje con la URL de la imagen
      db.ref("messages/" + timestamp).set({
        username,
        imageUrl,
      });
    } else if (message.trim() !== "") {
      // si no hay una URL de imagen, enviar un mensaje de texto normal
      db.ref("messages/" + timestamp).set({
        username,
        message,
      });
    }
  }
  
  // mostrar los mensajes
  const fetchChat = db.ref("messages/");
  
  fetchChat.on("child_added", function(snapshot) {
    const messageData = snapshot.val();
  
    let messageElement;
  
    if (messageData.imageUrl) {
      // si el mensaje contiene una URL de imagen, mostrar la imagen
      messageElement = `<li class="${username === messageData.username ? "sent" : "receive"}">
                          <span>${messageData.username}:</span> 
                          <img src="${messageData.imageUrl}" alt="Imagen enviada">
                        </li>`;
    } else {
      // si el mensaje es solo texto, mostrar el texto
      messageElement = `<li class="${username === messageData.username ? "sent" : "receive"}">
                          <span>${messageData.username}:</span> 
                          ${messageData.message}
                        </li>`;
    }
  
    // agregar el mensaje al chat
    document.getElementById("messages").innerHTML += messageElement;
  
    // desplazarse automáticamente hacia abajo
    const messagesDiv = document.getElementById("messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

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

  // Modificar la función para agregar usuario a la lista de usuarios activos
function addUserToActiveList(username) {
    const userRef = db.ref("presence/" + username);
    userRef.set(true); // Utiliza el nombre de usuario como clave y establece su estado como activo
  
    // Eliminar el registro de presencia del usuario al cerrar la ventana
    userRef.onDisconnect().remove();
  }
  
  // Modificar la función para eliminar usuario de la lista de usuarios activos
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

// Llamar a la función para detectar la actividad del usuario
detectUserActivity();

