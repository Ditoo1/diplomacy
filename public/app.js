let currentUser = null;
let posts = [];

// Inicialización de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBdZ1Yj-XBAhSIjlbaniYaVv2YAI1mihnQ",
    authDomain: "socialred-45a8b.firebaseapp.com",
    databaseURL: "https://socialred-45a8b-default-rtdb.firebaseio.com",
    projectId: "socialred-45a8b",
    storageBucket: "socialred-45a8b.appspot.com",
    messagingSenderId: "317857948271",
    appId: "1:317857948271:web:3a660e79fe1ce26e1d239a"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username.trim() !== '' && password.trim() !== '') {
        database.ref('users/' + username).once('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.password === password) {
                if (userData.status === 'approved') {
                    currentUser = userData;
                    localStorage.setItem('username', username);
                    showContentSection();
                    loadPosts();
                    if (username === 'Dito') {
                        document.getElementById('admin-btn').classList.remove('hidden');
                    }
                } else if (userData.status === 'pending') {
                    alert('Tu solicitud de registro está pendiente de aprobación.');
                } else {
                    alert('Tu cuenta ha sido rechazada.');
                }
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        });
    }
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const profilePic = document.getElementById('profile-pic').files[0];

    if (username.trim() !== '' && password.trim() !== '' && profilePic) {
        const storageRef = storage.ref('profile_pics/' + username);
        storageRef.put(profilePic).then((snapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL) => {
                database.ref('users/' + username).set({
                    username: username,
                    password: password,
                    profilePic: downloadURL,
                    status: 'pending'
                });
                alert('Solicitud de registro enviada. Espera la aprobación del administrador.');
                showLoginForm();
            });
        });
    } else {
        alert('Por favor, completa todos los campos y sube una foto de perfil.');
    }
}

function createPost() {
    const content = document.getElementById('post-content').value;
    if (content.trim() !== '') {
        const newPostRef = database.ref('posts').push();
        newPostRef.set({
            id: newPostRef.key,
            author: currentUser.username,
            content: content,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            authorPic: currentUser.profilePic
        });
        document.getElementById('post-content').value = '';
    }
}

function createReply(postId) {
    const replyContent = document.getElementById(`reply-${postId}`).value;
    if (replyContent.trim() !== '') {
        const newReplyRef = database.ref(`posts/${postId}/replies`).push();
        newReplyRef.set({
            author: currentUser.username,
            content: replyContent,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            authorPic: currentUser.profilePic
        });
        document.getElementById(`reply-${postId}`).value = '';
    }
}

function loadPosts() {
    database.ref('posts').on('value', (snapshot) => {
        posts = [];
        snapshot.forEach((childSnapshot) => {
            posts.push(childSnapshot.val());
        });
        posts.sort((a, b) => b.timestamp - a.timestamp);
        renderPosts();
    });
}

function renderPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.authorPic}" alt="Foto de perfil" class="post-author-pic">
                <div class="author">${post.author}</div>
            </div>
            <div class="content">${post.content}</div>
            <div class="replies">
                ${post.replies ? Object.values(post.replies).map(reply => `
                    <div class="reply">
                        <div class="reply-header">
                            <img src="${reply.authorPic}" alt="Foto de perfil" class="reply-author-pic">
                            <strong>${reply.author}:</strong>
                        </div>
                        <div>${reply.content}</div>
                    </div>
                `).join('') : ''}
            </div>
            <textarea id="reply-${post.id}" placeholder="Responder a esta publicación"></textarea>
            <button onclick="createReply('${post.id}')" class="small-btn">Responder</button>
        `;
        postsContainer.appendChild(postElement);
    });
}

function showContentSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('content-section').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.username;
    document.getElementById('user-pic').src = currentUser.profilePic;
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
        loadUsers();
    } else {
        adminPanel.classList.add('hidden');
    }
}

function loadUsers() {
    database.ref('users').on('value', (snapshot) => {
        const existingUsers = document.getElementById('existing-users');
        const pendingUsers = document.getElementById('pending-users');
        existingUsers.innerHTML = '';
        pendingUsers.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            const li = document.createElement('li');
            li.textContent = user.username;

            if (user.status === 'approved') {
                existingUsers.appendChild(li);
            } else if (user.status === 'pending') {
                const approveBtn = document.createElement('button');
                approveBtn.textContent = 'Aprobar';
                approveBtn.onclick = () => approveUser(user.username);
                approveBtn.className = 'small-btn';
                li.appendChild(approveBtn);

                const rejectBtn = document.createElement('button');
                rejectBtn.textContent = 'Rechazar';
                rejectBtn.onclick = () => rejectUser(user.username);
                rejectBtn.className = 'small-btn';
                li.appendChild(rejectBtn);

                pendingUsers.appendChild(li);
            }
        });
    });
}

function approveUser(username) {
    database.ref('users/' + username).update({ status: 'approved' });
}

function rejectUser(username) {
    database.ref('users/' + username).update({ status: 'rejected' });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('username');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('content-section').classList.add('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('logout-btn').classList.add('hidden');
    document.getElementById('admin-btn').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
}

function showLoginForm() {
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
}

// Manejar la selección de archivo
document.getElementById('profile-pic').addEventListener('change', function(e) {
    const fileName = e.target.files[0].name;
    document.getElementById('file-name').textContent = fileName;
});

// Verificar si el usuario ya está logueado
window.onload = function() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        database.ref('users/' + savedUsername).once('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.status === 'approved') {
                currentUser = userData;
                showContentSection();
                loadPosts();
                if (savedUsername === 'Dito') {
                    document.getElementById('admin-btn').classList.remove('hidden');
                }
            } else {
                localStorage.removeItem('username');
            }
        });
    }
};