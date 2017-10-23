// Client-side
var socket = io();

// Initiate a connection request from client to server to open a websocket & keep that connection open
socket.on('connect', function() {
  console.log('Connected to server');

  // Nested, because we don't want to emit an event until connected
  // 1st arg event name, 2nd arg data
  socket.emit('createMessage', {
    from: 'Jana',
    text: 'Yup, that works for me.'
  });
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

// Data emitted by the server event is the 1st arg in the callback
socket.on('newMessage', function(message) {
  console.log('newMessage', message);
});
