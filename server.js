const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Inicializa la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://democracy-a62c1-default-rtdb.firebaseio.com/"
});

const db = admin.database();
const messagesRef = db.ref('messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Sirve los archivos estáticos
app.use(express.static('public'));

// Escucha nuevos mensajes y envíalos a todos los clientes
messagesRef.on('child_added', snapshot => {
  const message = snapshot.val();
  io.emit('new message', message);
});

// Manejar la conexión de nuevos clientes
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  // Enviar historial de mensajes al nuevo usuario
  messagesRef.once('value', snapshot => {
    const messages = snapshot.val();
    if (messages) {
      const messageArray = Object.values(messages); // Convertir los mensajes a un array
      socket.emit('load messages', messageArray); // Enviar todos los mensajes al cliente que se conecta
    }
  });

  // Escuchar nuevos mensajes y guardarlos en Firebase
  socket.on('send message', (msg) => {
    const newMessageRef = messagesRef.push();
    newMessageRef.set(msg, (error) => {
      if (error) {
        console.error('Error al escribir en Firebase:', error);
      } else {
        console.log('Mensaje guardado en Firebase:', msg);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
