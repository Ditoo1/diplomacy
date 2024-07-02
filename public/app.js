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
                    currentUser = {
                        username: userData.username,
                        profilePic: userData.profilePic,
                        tag: userData.tag,
                        followers: userData.followers
                    };
                    localStorage.setItem('username', username);
                    showContentSection();
                    loadPosts();
                    if (userData.tag === 'admin' || userData.tag === 'mod') {
                        document.getElementById('admin-btn').classList.remove('hidden');
                    }
                } else if (userData.status === 'pending') {
                    alert('Tu solicitud de registro está pendiente de aprobación.');
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
                    status: 'pending',
                    tag: 'user',
                    followers: 0
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
            authorPic: currentUser.profilePic,
            likes: {},
            likeCount: 0
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
        const isVerified = post.author === 'Dito' ? '<span class="verified-badge" title="Creador de la plataforma">✅</span>' : '';
        const isLiked = post.likes && post.likes[currentUser.username];
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.authorPic || 'default_profile_pic.png'}" alt="Foto de perfil" class="post-author-pic" onclick="showUserProfile('${post.author}')">
                <div class="author" onclick="showUserProfile('${post.author}')">${post.author} ${isVerified}</div>
 <button onclick="likePost('${post.id}')" class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
    👍🏿 <span class="like-count">${post.likeCount || 0}</span>
</button>
            </div>
            <div class="content">${post.content}</div>
            <div class="replies">
                ${post.replies ? Object.values(post.replies).map(reply => `
                    <div class="reply">
                        <div class="reply-header">
                            <img src="${reply.authorPic || 'default_profile_pic.png'}" alt="Foto de perfil" class="reply-author-pic" onclick="showUserProfile('${reply.author}')">
                            <strong onclick="showUserProfile('${reply.author}')">${reply.author}:</strong>
                            <button onclick="likeReply('${post.id}', '${reply.id}')" class="like-btn ${reply.likes && reply.likes[currentUser.username] ? 'liked' : ''}" data-post-id="${post.id}" data-reply-id="${reply.id}">
                                👍🏿 <span class="like-count">${reply.likeCount || 0}</span>
                            </button>
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

function likePost(postId) {
    const postRef = database.ref(`posts/${postId}`);
    postRef.transaction((post) => {
        if (post) {
            if (!post.likes) post.likes = {};
            if (!post.likes[currentUser.username]) {
                post.likes[currentUser.username] = true;
                post.likeCount = (post.likeCount || 0) + 1;
            } else {
                delete post.likes[currentUser.username];
                post.likeCount = Math.max(0, (post.likeCount || 1) - 1);
            }
        }
        return post;
    }).then(() => {
        loadPosts();
    }).catch((error) => {
        console.error('Error al dar/quitar like:', error);
        alert('Hubo un error. Por favor, intenta de nuevo.');
    });
}

function likeReply(postId, replyId) {
    const replyRef = database.ref(`posts/${postId}/replies/${replyId}`);
    replyRef.transaction((reply) => {
        if (reply) {
            if (!reply.likes) reply.likes = {};
            if (!reply.likes[currentUser.username]) {
                reply.likes[currentUser.username] = true;
                reply.likeCount = (reply.likeCount || 0) + 1;
            } else {
                delete reply.likes[currentUser.username];
                reply.likeCount = (reply.likeCount || 1) - 1;
            }
        }
        return reply;
    }).then(() => {
        loadPosts();
    }).catch((error) => {
        console.error('Error al dar/quitar like a la respuesta:', error);
        alert('Hubo un error. Por favor, intenta de nuevo.');
    });
}

function showContentSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('content-section').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.username;
    document.getElementById('user-pic').src = currentUser.profilePic || 'default_profile_pic.png';
    if (currentUser.tag === 'admin') {
        document.getElementById('admin-btn').classList.remove('hidden');
    } else {
        document.getElementById('admin-btn').classList.add('hidden');
    }
}

function showUserProfile(username) {
    document.getElementById('content-section').classList.add('hidden');
    
    const profileSection = document.createElement('div');
    profileSection.id = 'profile-section';
    profileSection.className = 'section';
    
    database.ref(`users/${username}`).on('value', (snapshot) => {
        const userData = snapshot.val();
        const isFollowing = userData.followers && userData.followers[currentUser.username];
        profileSection.innerHTML = `
            <h2>${username}'s Profile ${username === 'Dito' ? '<span class="verified-badge" title="Creador de la plataforma">✅</span>' : ''}</h2>
            <img src="${userData.profilePic || 'default_profile_pic.png'}" alt="Foto de perfil" class="profile-pic">
            <p class="bio">${userData.bio || 'No hay biografía disponible.'}</p>
            <p>Seguidores: <span id="follower-count">${Object.keys(userData.followers || {}).length}</span></p>
            ${currentUser.username !== username ? 
                `<button onclick="toggleFollow('${username}')" class="small-btn" id="follow-btn">
                    ${isFollowing ? 'Dejar de seguir' : 'Seguir'}
                </button>` : 
                ''}
            <button onclick="backToMainContent()" class="small-btn">Volver</button>
        `;
    });
    
    document.body.appendChild(profileSection);
}
function backToMainContent() {
    document.getElementById('profile-section').remove();
    document.getElementById('content-section').classList.remove('hidden');
    loadPosts();
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel.style.display === "none" || adminPanel.style.display === "") {
        adminPanel.style.display = "block";
        loadUsers();
    } else {
        adminPanel.style.display = "none";
    }
}

function loadUsers() {
    if (currentUser.tag !== 'admin') {
        alert('No tienes permiso para acceder a esta función.');
        return;
    }

    database.ref('users').once('value', (snapshot) => {
        const existingUsers = document.getElementById('existing-users');
        const pendingUsers = document.getElementById('pending-users');
        existingUsers.innerHTML = '';
        pendingUsers.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            const li = document.createElement('li');
            li.textContent = `${user.username} (${user.tag})`;

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

function followUser(username) {
    if (currentUser.username === username) {
        alert('No puedes seguirte a ti mismo.');
        return;
    }
    
    database.ref(`users/${username}/followers`).transaction((followers) => {
        return (followers || 0) + 1;
    }).then(() => {
        alert(`Ahora sigues a ${username}`);
        loadPosts(); // Recarga los posts para actualizar el contador de seguidores
    }).catch((error) => {
        console.error('Error al seguir al usuario:', error);
        alert('Hubo un error al intentar seguir al usuario. Por favor, intenta de nuevo.');
    });
}

function toggleFollow(username) {
    const userRef = database.ref(`users/${username}/followers/${currentUser.username}`);
    userRef.once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                // Si ya sigue, deja de seguir
                return userRef.remove();
            } else {
                // Si no sigue, empieza a seguir
                return userRef.set(true);
            }
        })
        .then(() => {
            // Actualiza el botón y el contador
            const followBtn = document.getElementById('follow-btn');
            const followerCount = document.getElementById('follower-count');
            if (followBtn.textContent === 'Seguir') {
                followBtn.textContent = 'Dejar de seguir';
                followerCount.textContent = parseInt(followerCount.textContent) + 1;
            } else {
                followBtn.textContent = 'Seguir';
                followerCount.textContent = Math.max(0, parseInt(followerCount.textContent) - 1);
            }
        })
        .catch((error) => {
            console.error('Error al cambiar el estado de seguimiento:', error);
            alert('Hubo un error. Por favor, intenta de nuevo.');
        });
}

function approveUser(username) {
    database.ref('users/' + username).update({ status: 'approved' });
}

function rejectUser(username) {
    // Primero, eliminamos al usuario de la base de datos
    database.ref('users/' + username).remove()
        .then(() => {
            console.log("Usuario rechazado y eliminado: " + username);
            alert(`El usuario ${username} ha sido rechazado y eliminado de la base de datos.`);
            // Actualizamos la lista de usuarios pendientes
            loadUsers();
        })
        .catch((error) => {
            console.error("Error al eliminar el usuario: ", error);
            alert("Hubo un error al rechazar al usuario. Por favor, intenta de nuevo.");
        });
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