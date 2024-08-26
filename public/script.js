// Inicialización de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBFtJWTdqfS0MXCwWzFrHZNoqaCpHKXoC0",
    authDomain: "chat-fcc15.firebaseapp.com",
    databaseURL: "https://chat-fcc15-default-rtdb.firebaseio.com",
    projectId: "chat-fcc15",
    storageBucket: "chat-fcc15.appspot.com",
    messagingSenderId: "349866955859",
    appId: "1:349866955859:web:c166c2f9dd4a4aed01a2a6"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// Variables globales para gestionar el estado del reproductor
let currentAudio = null;
let currentTrackInfo = null;

// Función para cargar los artistas desde la base de datos
function loadArtists() {
    const artistFeed = document.getElementById('artist-feed');
    const artistsRef = database.ref('artists');

    artistsRef.on('value', (snapshot) => {
        artistFeed.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const artist = childSnapshot.val();
            const artistId = childSnapshot.key;
            const artistCard = `
                <div class="artist-card" data-artist-id="${artistId}">
                    <img src="${artist.imageUrl}" alt="${artist.name}" class="artist-image">
                    <h2>${artist.name}</h2>
                    <p>${artist.genre}</p>
                </div>
            `;
            artistFeed.innerHTML += artistCard;
        });

        // Añadir eventos a las tarjetas de los artistas
        const artistCards = document.querySelectorAll('.artist-card');
        artistCards.forEach(card => {
            card.addEventListener('click', () => {
                const artistId = card.getAttribute('data-artist-id');
                showArtistPage(artistId);
            });
        });
    });
}

// Función para mostrar la página del artista y sus detalles
function showArtistPage(artistId) {
    const artistPage = document.getElementById('artist-page');
    const artistDetails = document.getElementById('artist-details');
    const artistsRef = database.ref('artists/' + artistId);

    artistsRef.once('value', (snapshot) => {
        const artist = snapshot.val();
        let albumsHtml = '';
        let allTracks = [];

        Object.entries(artist.albums || {}).forEach(([albumId, album]) => {
            let tracksHtml = '';
            Object.entries(album.tracks || {}).forEach(([trackId, track]) => {
                allTracks.push({...track, id: trackId, albumId: albumId});
                tracksHtml += `
                    <div class="track" onclick="playTrack('${artistId}', '${albumId}', '${trackId}', '${artist.name}', '${track.name}', '${album.coverUrl}')">
                        <span class="track-number">${track.number}</span>
                        <span>${track.name}</span>
                        <span>(${track.listens || 0} escuchas)</span>
                    </div>
                `;
            });

            albumsHtml += `
                <div class="album">
                    <img src="${album.coverUrl}" alt="${album.title}" class="album-cover">
                    <h3>${album.title}</h3>
                    <p>${album.year}</p>
                    ${tracksHtml}
                </div>
            `;
        });

        // Ordenar y mostrar las 5 canciones más escuchadas
        allTracks.sort((a, b) => (b.listens || 0) - (a.listens || 0));
        const topTracks = allTracks.slice(0, 5);

        let topTracksHtml = '<h3>Top 5 Canciones</h3>';
        topTracks.forEach((track, index) => {
            topTracksHtml += `
                <div class="track" onclick="playTrack('${artistId}', '${track.albumId}', '${track.id}', '${artist.name}', '${track.name}', '${artist.albums[track.albumId].coverUrl}')">
                    <span class="track-number">${index + 1}</span>
                    <span>${track.name}</span>
                    <span>(${track.listens || 0} escuchas)</span>
                </div>
            `;
        });

        // Mostrar los detalles del artista, sus álbumes y las top canciones
        artistDetails.innerHTML = `
            <div class="artist-profile">
                <img src="${artist.imageUrl}" alt="${artist.name}" class="artist-profile-image">
                <div class="artist-info">
                    <h2>${artist.name}</h2>
                    <p>${artist.genre}</p>
                    <p>${artist.biography}</p>
                </div>
            </div>
            ${topTracksHtml}
            <h3>Álbumes</h3>
            ${albumsHtml}
        `;

        artistPage.classList.remove('hidden');
    });
}

// Función para reproducir una pista seleccionada
function playTrack(artistId, albumId, trackId, artistName, trackName, albumCover) {
    // Detener la pista actual si hay una en reproducción
    if (currentAudio) {
        currentAudio.pause();
    }

    currentTrackInfo = { artistId, albumId, trackId };

    const storageRef = storage.ref(`music/${artistId}/${albumId}/${trackId}.mp3`);
    storageRef.getDownloadURL().then((url) => {
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.src = url;
        audioPlayer.play().then(() => {
            // Actualizar la interfaz del reproductor
            document.getElementById('player-image').src = albumCover;
            document.getElementById('player-track-name').textContent = trackName;
            document.getElementById('player-artist-name').textContent = artistName;

            currentAudio = audioPlayer;

            updatePlayPauseButton();
            startListenTimer();
        }).catch((error) => {
            console.error("Error en la reproducción:", error);
        });
    }).catch((error) => {
        console.error("Error al obtener la URL de descarga:", error);
    });
}

// Función para empezar a contar la reproducción de la pista (escuchas)
function startListenTimer() {
    if (currentTrackInfo) {
        setTimeout(() => {
            incrementListens(currentTrackInfo.artistId, currentTrackInfo.albumId, currentTrackInfo.trackId);
        }, 10000);  // Aumentar escuchas después de 10 segundos
    }
}

// Función para incrementar el número de escuchas de una pista
function incrementListens(artistId, albumId, trackId) {
    const trackRef = database.ref(`artists/${artistId}/albums/${albumId}/tracks/${trackId}/listens`);
    trackRef.transaction((currentListens) => {
        return (currentListens || 0) + 1;
    });
}

// Configuración del botón de volver
function setupBackButton() {
    const backButton = document.getElementById('back-button');
    const artistPage = document.getElementById('artist-page');

    backButton.addEventListener('click', () => {
        artistPage.classList.add('hidden');
    });
}

// Configuración del reproductor de audio
function setupAudioPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress');

    playPauseBtn.addEventListener('click', togglePlayPause);

    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
    });

    audioPlayer.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}

// Función para alternar entre play y pause
function togglePlayPause() {
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
    updatePlayPauseButton();
}

// Función para actualizar el botón de play/pause
function updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer.paused) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

// Inicializar la aplicación
loadArtists();
setupBackButton();
setupAudioPlayer();
