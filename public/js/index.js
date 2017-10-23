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
  // Use jQuery to create an li element for the ol in index.html
  var li = jQuery('<li></li>');
  li.text(message.from + ': ' + message.text);

  // Append it
  jQuery('#messages').append(li);
});

// Custom event listener for the message submit form
jQuery('#message-form').on('submit', function(e) {
  // Prevent default page refresh when submit button is pushed
  e.preventDefault();
  socket.emit(
    'createMessage',
    {
      from: 'User',
      // Get value from input field with name attribute equal to "message"
      text: jQuery('[name=message]').val()
    },
    function() {
      // Callback for acknowledgement
    }
  );
});
