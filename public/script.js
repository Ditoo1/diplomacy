const firebaseConfig = {
    apiKey: "AIzaSyCT6NTghTAmIKMbBV6j8a8jQpG_0p9j3MU",
    authDomain: "nichat-ac9af.firebaseapp.com",
    databaseURL: "https://nichat-ac9af-default-rtdb.firebaseio.com",
    projectId: "nichat-ac9af",
    storageBucket: "nichat-ac9af.firebasestorage.app",
    messagingSenderId: "1054450055173",
    appId: "1:1054450055173:web:dba2ca2c9e3385997ec46c",
    measurementId: "G-7NFNW6GDLX"
  };
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Elementos del DOM
  const chatContainer = document.querySelector('.chat-container');
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const logoutButton = document.getElementById('logout');
  const toggleThemeButton = document.getElementById('toggle-theme');
  const usernameModal = document.getElementById('username-modal');
  const usernameInput = document.getElementById('username-input');
  const modalSubmitButton = document.getElementById('modal-submit');
  const mentionAutocomplete = document.getElementById('mention-autocomplete');
  const mentionList = document.getElementById('mention-list');
  
  // Variables de estado
  let currentUser = null;
  let availableUsers = ['Dante'];
  let currentMentionStartPos = -1;
  let selectedMentionIndex = -1;
  
  // Referencias Firebase
  const messagesRef = database.ref('messages');
  const activeUsersRef = database.ref('activeUsers');
  
  // Inicialización
  function init() {
    checkAuthState();
    setupEventListeners();
    applySystemTheme();
  }
  
  // Verificar estado de autenticación
  function checkAuthState() {
    currentUser = localStorage.getItem('chat-username');
    if (currentUser) {
      usernameModal.style.display = 'none';
      chatContainer.style.display = 'flex';
      registerActiveUser(currentUser);
    }
  }
  
  // Registrar usuario activo
  function registerActiveUser(username) {
    activeUsersRef.child(sanitizeUsername(username)).set(username);
  }
  
  // Sanitizar nombre de usuario
  function sanitizeUsername(username) {
    return username.replace(/[.#$/[\]]/g, '_');
  }
  
  // Configurar event listeners
  function setupEventListeners() {
    // Modal
    modalSubmitButton.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  
    // Chat
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', handleKeyDown);
    userInput.addEventListener('input', handleInput);
    
    // UI
    logoutButton.addEventListener('click', handleLogout);
    toggleThemeButton.addEventListener('click', toggleTheme);
  
    // Firebase
    activeUsersRef.on('value', updateAvailableUsers);
    messagesRef.orderByChild('timestamp').limitToLast(100).on('child_added', addMessage);
  }
  
  // Manejar login
  function handleLogin() {
    const username = usernameInput.value.trim();
    if (username) {
      currentUser = username;
      localStorage.setItem('chat-username', username);
      usernameModal.style.display = 'none';
      chatContainer.style.display = 'flex';
      registerActiveUser(username);
    }
  }
  
  // Manejar logout
  function handleLogout() {
    if (currentUser) {
      activeUsersRef.child(sanitizeUsername(currentUser)).remove();
      localStorage.removeItem('chat-username');
      window.location.reload();
    }
  }
  
  // Actualizar lista de usuarios disponibles
  function updateAvailableUsers(snapshot) {
    availableUsers = ['Asistente'];
    snapshot.forEach(child => {
      const username = child.val();
      if (username && !availableUsers.includes(username)) {
        availableUsers.push(username);
      }
    });
  }
  
  // Enviar mensaje
  function sendMessage() {
    const text = userInput.value.trim();
    if (!text || !currentUser) return;
  
    messagesRef.push({
      sender: currentUser,
      text: text,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      processed: false
    });
  
    userInput.value = '';
    hideMentionSuggestions();
  }
  
  // Añadir mensaje al chat
  function addMessage(snapshot) {
    const msg = snapshot.val();
    if (!msg) return;
  
    const isCurrentUser = msg.sender === currentUser;
    const messageClass = isCurrentUser ? 'user-message' : 'bot-message';
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', messageClass);
    messageElement.innerHTML = `
      <div class="message-sender">${msg.sender}</div>
      <div class="message-text">${formatMessageText(msg.text)}</div>
    `;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  // Formatear texto con menciones
  function formatMessageText(text) {
    return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }
  
  // Autocompletado de menciones
  function handleInput() {
    const text = userInput.value;
    const cursorPos = userInput.selectionStart;
    const lastAtPos = text.lastIndexOf('@', cursorPos);
  
    if (lastAtPos >= 0 && (cursorPos === lastAtPos + 1 || /^[\w@]$/.test(text.slice(lastAtPos + 1, cursorPos)))) {
      currentMentionStartPos = lastAtPos;
      const query = text.slice(lastAtPos + 1, cursorPos).toLowerCase();
      const matches = availableUsers.filter(user => 
        user.toLowerCase().includes(query)
      );
      showMentionSuggestions(matches);
    } else {
      hideMentionSuggestions();
    }
  }
  
  // Mostrar sugerencias de menciones
  function showMentionSuggestions(users) {
    mentionList.innerHTML = '';
    
    if (users.length === 0) {
      hideMentionSuggestions();
      return;
    }
    
    users.forEach((user, index) => {
      const li = document.createElement('li');
      li.textContent = user;
      li.dataset.index = index;
      li.addEventListener('click', () => selectMention(user));
      mentionList.appendChild(li);
    });
    
    selectedMentionIndex = 0;
    updateSelectedMention();
    mentionAutocomplete.style.display = 'block';
  }
  
  // Ocultar sugerencias
  function hideMentionSuggestions() {
    mentionAutocomplete.style.display = 'none';
    currentMentionStartPos = -1;
    selectedMentionIndex = -1;
  }
  
  // Seleccionar mención
  function selectMention(username) {
    const text = userInput.value;
    userInput.value = text.slice(0, currentMentionStartPos) + `@${username} ` + text.slice(userInput.selectionStart);
    userInput.focus();
    hideMentionSuggestions();
  }
  
  // Manejar teclado
  function handleKeyDown(e) {
    // Navegación en autocompletado
    if (mentionAutocomplete.style.display !== 'none') {
      const items = mentionList.querySelectorAll('li');
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          selectedMentionIndex = Math.max(0, selectedMentionIndex - 1);
          updateSelectedMention();
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          selectedMentionIndex = Math.min(items.length - 1, selectedMentionIndex + 1);
          updateSelectedMention();
          break;
          
        case 'Enter':
          e.preventDefault();
          if (selectedMentionIndex >= 0) {
            selectMention(items[selectedMentionIndex].textContent);
          }
          break;
          
        case 'Escape':
          hideMentionSuggestions();
          break;
      }
    }
    
    // Enviar mensaje con Enter (sin Shift)
    if (e.key === 'Enter' && !e.shiftKey && mentionAutocomplete.style.display === 'none') {
      e.preventDefault();
      sendMessage();
    }
  }
  
  // Actualizar mención seleccionada
  function updateSelectedMention() {
    const items = mentionList.querySelectorAll('li');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedMentionIndex);
      if (index === selectedMentionIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }
  
  // Tema oscuro/claro
  function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('chat-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
  }
  
  function applySystemTheme() {
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
      document.body.classList.toggle('light-mode', savedTheme === 'light');
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-mode');
    }
  }
  
  // Iniciar aplicación
  init();