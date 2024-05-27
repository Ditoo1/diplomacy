const firebaseConfig = {
    apiKey: "AIzaSyC643BZysfS-TkAo5sUhmRREwE9MurGoD8",
    authDomain: "democracy-a62c1.firebaseapp.com",
    databaseURL: "https://democracy-a62c1-default-rtdb.firebaseio.com",
    projectId: "democracy-a62c1",
    storageBucket: "democracy-a62c1.appspot.com",
    messagingSenderId: "1092075734405",
    appId: "1:1092075734405:web:f8c9320c60104acc8370ec"
  };

  firebase.initializeApp(firebaseConfig);

  // initialize database
  const db = firebase.database();
  
// get user's data
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Por favor, introduce tu nombre chistosín:");
  localStorage.setItem("username", username);
}

// Validar que el nombre no esté vacío
while (!username.trim()) {
  username = prompt("¡Ups! Parece que no ingresaste un nombre. Por favor, introduce tu nombre chistosín:");
  localStorage.setItem("username", username);
}


  
  // submit form
  // listen for submit event on the form and call the postChat function
  document.getElementById("message-form").addEventListener("submit", sendMessage);
  
  // send message to db
  function sendMessage(e) {
    e.preventDefault();
  
    // get values to be submitted
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
  
    // clear the input box
    messageInput.value = "";
  
    //auto scroll to bottom
    document
      .getElementById("messages")
      .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  
    // create db collection and send in the data
    db.ref("messages/" + timestamp).set({
      username,
      message,
    });
  }
  
 // display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.on("child_added", function(snapshot) {
  const messages = snapshot.val();
  const message = `<li class=${username === messages.username ? "sent" : "receive"}><span>${messages.username}: </span>${messages.message}</li>`;
  // append the message on the page
  document.getElementById("messages").innerHTML += message;

  // scroll to bottom
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
