// script.js
let currentUser = localStorage.getItem('username') || '';
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

function login() {
    const username = document.getElementById('username').value;
    if (username.trim() !== '') {
        currentUser = username;
        localStorage.setItem('username', username);
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('content-section').classList.remove('hidden');
        loadPosts();
    }
}

function createPost() {
    const content = document.getElementById('post-content').value;
    if (content.trim() !== '') {
        const newPostRef = database.ref('posts').push();
        newPostRef.set({
            id: newPostRef.key,
            author: currentUser,
            content: content,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        document.getElementById('post-content').value = '';
    }
}

function createReply(postId) {
    const replyContent = document.getElementById(`reply-${postId}`).value;
    if (replyContent.trim() !== '') {
        const newReplyRef = database.ref(`posts/${postId}/replies`).push();
        newReplyRef.set({
            author: currentUser,
            content: replyContent,
            timestamp: firebase.database.ServerValue.TIMESTAMP
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
            <div class="author">${post.author}</div>
            <div class="content">${post.content}</div>
            <div class="replies">
                ${post.replies ? Object.values(post.replies).map(reply => `<div><strong>${reply.author}:</strong> ${reply.content}</div>`).join('') : ''}
            </div>
            <textarea id="reply-${post.id}" placeholder="Responder a este chirp"></textarea>
            <button onclick="createReply('${post.id}')">Responder</button>
        `;
        postsContainer.appendChild(postElement);
    });
}

// Verificar si el usuario ya está logueado
window.onload = function() {
    if (currentUser) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('content-section').classList.remove('hidden');
        loadPosts();
    }
};