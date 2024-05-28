// Configura tu proyecto Firebase aquí
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
};

// Inicialización de Firebase
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

// Función para manejar el evento de inicio de sesión
function login() {
    const username = document.getElementById('usernameInput').value.trim();
    if (username !== '') {
        // Guardar el nombre de usuario en el almacenamiento local
        localStorage.setItem('username', username);
        document.getElementById('login-container').style.display = 'none'; // Ocultar el contenedor de inicio de sesión
        document.getElementById('app').style.display = 'block'; // Mostrar la aplicación
        // Mostrar el nombre de usuario
        document.getElementById('loggedInUser').innerText = `Bienvenido, ${username}!`;
    } else {
        alert('Por favor, ingrese su nombre.');
    }
}

// Función para cerrar sesión
function logout() {
    // Eliminar el nombre de usuario del almacenamiento local
    localStorage.removeItem('username');
    // Mostrar el contenedor de inicio de sesión y ocultar la aplicación
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('app').style.display = 'none';
    // Limpiar el nombre de usuario mostrado
    document.getElementById('loggedInUser').innerText = '';
}

// Verificar si hay un nombre de usuario almacenado en el almacenamiento local al cargar la página
window.onload = function() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        // Mostrar la aplicación y el nombre de usuario almacenado si existe
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.getElementById('loggedInUser').innerText = `Bienvenido, ${storedUsername}!`;
    }
};

// Función para publicar un nuevo mensaje
function post() {
    const postText = document.getElementById('postInput').value.trim();
    if (postText !== '') {
        const username = document.getElementById('usernameInput').value.trim(); // Obtener el nombre de usuario
        if (username !== '') {
            const newPostRef = database.ref('posts').push();
            newPostRef.set({
                text: postText,
                username: username, // Almacenar el nombre de usuario junto con la publicación
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                time: getCurrentTime() // Agregar la hora y fecha actual al mensaje
            });
            document.getElementById('postInput').value = '';
        } else {
            alert('Por favor, ingrese su nombre.');
        }
    } else {
        alert('Por favor, ingrese un mensaje.');
    }
}

// Cargar mensajes existentes y escuchar cambios en tiempo real
database.ref('posts').on('child_added', function(data) {
    const post = data.val();
    const postElement = document.createElement('div');
    postElement.classList.add('post', 'active'); // Agregamos la clase 'active' para hacer visible la publicación
    postElement.innerHTML = `
        <p><strong>${post.username}</strong>: ${post.text}</p>
        <span class="timestamp">${post.time}</span>
    `;
    document.getElementById('posts').prepend(postElement); // Cambiado a prepend para mostrar mensajes más recientes primero
});