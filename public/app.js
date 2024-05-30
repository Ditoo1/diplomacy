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
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DIC"];
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
     // Dentro de la función post()
const newPostRef = database.ref('posts').push();
newPostRef.set({
    text: postText,
    username: username,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    time: getCurrentTime(),
    reactions: 0 // Agregar un contador de reacciones inicializado en 0
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
        commentInput.value = '';
    } else {
        alert('Por favor, ingrese un comentario.');
    }
}

function reactToPost(postId) {
    const postRef = database.ref(`posts/${postId}`);
    postRef.transaction(function(post) {
        console.log("Post antes de la transacción:", post); // Agregamos esta línea para depurar
        if (post) {
            if (!post.reactions) {
                post.reactions = {};
            }
            const currentUser = localStorage.getItem('username');
            if (!post.reactions[currentUser]) {
                post.reactions[currentUser] = true; // Añadir like del usuario actual
                post.reactionCount = (post.reactionCount || 0) + 1; // Incrementar el contador de likes
            } else {
                delete post.reactions[currentUser]; // Quitar like del usuario actual
                post.reactionCount = Math.max(0, (post.reactionCount || 0) - 1); // Disminuir el contador de likes
            }
        } else {
            // Si no hay datos de la publicación, crear una nueva con el contador de likes
            post = {
                reactions: {
                    [localStorage.getItem('username')]: true
                },
                reactionCount: 1
            };
        }
        console.log("Post después de la transacción:", post); // Agregamos esta línea para depurar
        return post;
    });
}



// Cargar mensajes existentes y escuchar cambios en tiempo real
database.ref('posts').on('child_added', function(data) {
    const post = data.val();
    const postId = data.key;
    const postElement = document.createElement('div');
    postElement.classList.add('post', 'active'); // Agregamos la clase 'active' para hacer visible la publicación
    postElement.innerHTML = `
        <p style="white-space: pre-wrap;"><strong>${post.username}</strong>: ${post.text}</p>
        <span class="timestamp">${post.time}</span>
        <div class="reactions">
            <button class="reaction-button" onclick="reactToPost('${postId}')">👍🏿</button>
            <span class="reaction-count" id="reactionCount-${postId}">${post.reactionCount || 0}</span>
        </div>
        <div class="comments" id="comments-${postId}">
            <!-- Comentarios serán añadidos aquí -->
        </div>
        <input type="text" id="commentInput-${postId}" placeholder="Añadir un comentario" />
        <button onclick="handleAddComment('${postId}')">Comentar</button>
    `;

    // Escuchar cambios en el contador de likes
    database.ref(`posts/${postId}/reactionCount`).on('value', function(snapshot) {
        const reactionCount = snapshot.val();
        const reactionCountElement = document.getElementById(`reactionCount-${postId}`);
        if (reactionCountElement) {
            reactionCountElement.textContent = reactionCount || 0;
        }
    });

    document.getElementById('posts').prepend(postElement);

    // Escuchar cambios en los comentarios
    database.ref(`comments/${postId}`).on('child_added', function(commentData) {
        const comment = commentData.val();
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <p><strong>${comment.username}</strong>: ${comment.text}</p>
            <p class="comment-timestamp">${comment.time}</p> <!-- Añadido el timestamp aquí -->
        `;
        document.getElementById(`comments-${postId}`).appendChild(commentElement);
    });
});