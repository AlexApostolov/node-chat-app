// Client-side
var socket = io();

// Initiate a connection request from client to server to open a websocket & keep that connection open
socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

// Data emitted by the server event is the 1st arg in the callback
socket.on('newMessage', function(message) {
  console.log('newMessage', message);
});
