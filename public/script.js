// Configuración de Firebase
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
  
  const colors = [
      '#4CAF50', '#FFC107', '#2196F3', '#E91E63', '#9C27B0',
      '#00BCD4', '#FF5722', '#795548', '#607D8B', '#3F51B5'
  ];
  
  let userColors = {};
  
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
  
  function updateUsers(snapshot) {
      usersList.innerHTML = '';
      const users = [];
      snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.key;
          users.push(user);
          if (!userColors[user]) {
              userColors[user] = colors[Math.floor(Math.random() * colors.length)];
          }
      });
      usersList.textContent = users.join(', ');
  }
  
  function addMessage(snapshot) {
      const message = snapshot.val();
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.classList.add(message.sender === currentUser ? 'sent' : 'received');
      
      const senderElement = document.createElement('span');
      senderElement.classList.add('sender');
      senderElement.style.color = userColors[message.sender] || '#ffffff';
      senderElement.textContent = message.sender + ': ';
      
      const textElement = document.createElement('span');
      textElement.innerHTML = formatMessage(message.text);
      
      messageElement.appendChild(senderElement);
      messageElement.appendChild(textElement);
      
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function formatMessage(text) {
      return text.replace(/@(\w+)/g, (match, username) => {
          if (userColors[username]) {
              return `<span class="mention" style="background-color: ${userColors[username]}40;">@${username}</span>`;
          }
          return match;
      });
  }
  
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
  
  // Agregar autocompletado de menciones
  messageInput.addEventListener('input', function() {
      const cursorPosition = this.selectionStart;
      const textBeforeCursor = this.value.slice(0, cursorPosition);
      const match = textBeforeCursor.match(/@(\w*)$/);
      
      if (match) {
          const partial = match[1].toLowerCase();
          const matchingUsers = Object.keys(userColors).filter(user => 
              user.toLowerCase().startsWith(partial) && user !== currentUser
          );
          
          if (matchingUsers.length > 0) {
              const autocompleteList = document.createElement('div');
              autocompleteList.id = 'autocomplete';
              matchingUsers.forEach(user => {
                  const userElement = document.createElement('div');
                  userElement.textContent = user;
                  userElement.addEventListener('click', () => {
                      this.value = this.value.slice(0, cursorPosition - match[1].length) + 
                                   user + 
                                   this.value.slice(cursorPosition);
                      this.focus();
                      autocompleteList.remove();
                  });
                  autocompleteList.appendChild(userElement);
              });
              document.body.appendChild(autocompleteList);
          }
      } else {
          const existingAutocomplete = document.getElementById('autocomplete');
          if (existingAutocomplete) {
              existingAutocomplete.remove();
          }
      }
  });