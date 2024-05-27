var loggedIn1 = false;

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
    var messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.classList.add("message", "outgoing");
    
    // Crear botón de eliminar
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", function() {
      messageDiv.remove();
    });
    
    // Adjuntar el botón de eliminar al mensaje
    messageDiv.appendChild(deleteButton);

    document.getElementById("messageArea" + chatNumber).appendChild(messageDiv);
    userInput.value = "";
    document.getElementById("messageArea" + chatNumber).scrollTop = document.getElementById("messageArea" + chatNumber).scrollHeight;
  }
}

document.getElementById("sendBtn1").addEventListener("click", function() {
  sendMessage(1);
});
