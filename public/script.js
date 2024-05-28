// Configura tu proyecto Firebase aquí
const firebaseConfig = {
    apiKey: "AIzaSyBdZ1Yj-XBAhSIjlbaniYaVv2YAI1mihnQ",
    authDomain: "socialred-45a8b.firebaseapp.com",
    databaseURL: "https://socialred-45a8b-default-rtdb.firebaseio.com",
    projectId: "socialred-45a8b",
    storageBucket: "socialred-45a8b.appspot.com",
    messagingSenderId: "317857948271",
    appId: "1:317857948271:web:3a660e79fe1ce26e1d239a"
  };

  firebase.initializeApp(firebaseConfig);

  // Referencia a la base de datos
  const database = firebase.database();
  
  // Función para obtener la hora y fecha actual en el formato deseado
  function getCurrentTime() {
      const now = new Date();
      const hours = now.getHours() > 12 ? now.getHours() - 12 : now.getHours();
      const minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = monthNames[now.getMonth()];
      const day = now.getDate();
      const year = now.getFullYear();
      return hours + ':' + minutes + ' ' + ampm + ' - ' + day + ' ' + month + ' ' + year;
  }
  
  // Función para publicar un nuevo mensaje
  function post() {
      const postText = document.getElementById('postInput').value.trim();
      if (postText !== '') {
          const newPostRef = database.ref('posts').push();
          newPostRef.set({
              text: postText,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
              time: getCurrentTime() // Agregar la hora y fecha actual al mensaje
          });
          document.getElementById('postInput').value = '';
      }
  }
  
  // Cargar mensajes existentes y escuchar cambios en tiempo real
  database.ref('posts').on('child_added', function(data) {
      const post = data.val();
      const postElement = document.createElement('div');
      postElement.classList.add('post', 'active'); // Agregamos la clase 'active' para hacer visible la publicación
      postElement.innerHTML = `
          <p>${post.text}</p>
          <span class="timestamp">${post.time}</span>
      `;
      document.getElementById('posts').prepend(postElement); // Cambiado a prepend para mostrar mensajes más recientes primero
  });