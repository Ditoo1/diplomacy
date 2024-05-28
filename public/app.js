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
        const username = localStorage.getItem('username'); // Obtener el nombre de usuario desde el almacenamiento local
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

// Función para añadir un nuevo comentario
function addComment(postId, commentText) {
    const username = localStorage.getItem('username');
    if (username !== '') {
        const newCommentRef = database.ref(`comments/${postId}`).push();
        newCommentRef.set({
            text: commentText,
            username: username,
            time: getCurrentTime()
        });
    } else {
        alert('Por favor, ingrese su nombre.');
    }
}

// Función para manejar el evento de añadir un comentario
function handleAddComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentText = commentInput.value.trim();
    if (commentText !== '') {
        addComment(postId, commentText);
        commentInput.value = ''; // Limpiar el cuadro de texto del comentario
    } else {
        alert('Por favor, ingrese un comentario.');
    }
}

// Función para cargar las publicaciones y los comentarios desde la base de datos
function loadPosts() {
    const postsRef = database.ref('posts');
    postsRef.on('child_added', function(snapshot) {
        const post = snapshot.val();
        const postId = snapshot.key;
        displayPost(postId, post);
    });
}

// Función para mostrar una publicación en la página
function displayPost(postId, post) {
    const postsContainer = document.getElementById('postsContainer');

    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.classList.add('active');

    postElement.innerHTML = `
        <p><strong>${post.username}</strong>: ${post.text}</p>
        <div class="timestamp">${post.time}</div>
        <div class="comments" id="comments-${postId}">
            <input type="text" id="commentInput-${postId}" placeholder="Añadir un comentario">
            <button onclick="handleAddComment('${postId}')">Comentar</button>
        </div>
    `;

    postsContainer.appendChild(postElement);

    loadComments(postId);
}

// Función para cargar los comentarios de una publicación
function loadComments(postId) {
    const commentsRef = database.ref(`comments/${postId}`);
    commentsRef.on('child_added', function(snapshot) {
        const comment = snapshot.val();
        displayComment(postId, comment);
    });
}

// Función para mostrar un comentario en una publicación
function displayComment(postId, comment) {
    const commentsContainer = document.getElementById(`comments-${postId}`);

    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');

    commentElement.innerHTML = `
        <p><strong>${comment.username}</strong>: ${comment.text}</p>
        <div class="timestamp">${comment.time}</div>
    `;

    commentsContainer.appendChild(commentElement);
}

// Cargar las publicaciones al iniciar la aplicación
loadPosts();