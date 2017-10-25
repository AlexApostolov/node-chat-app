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
  var formattedTime = moment(message.createdAt).format('h:mm a');
  // Use jQuery to create an li element for the ol in index.html
  var li = jQuery('<li></li>');
  li.text(message.from + ' ' + formattedTime + ': ' + message.text);

  // Append it
  jQuery('#messages').append(li);
});

// Add event listener for newLocationMessage event
socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = jQuery('<li></li>');
  // Link that will open in a new tab to avoid getting kicked out of the chat room
  var a = jQuery('<a target="_blank">My current location</a>');

  li.text(message.from + ' ' + formattedTime + ': ');
  // Set the href value of the link--one arg for getting and two args for setting
  // in a way that prevents malicious code injection
  a.attr('href', message.url);
  li.append(a);
  jQuery('#messages').append(li);
});

// Custom event listener for the message submit form
jQuery('#message-form').on('submit', function(e) {
  // Prevent default page refresh when submit button is pushed
  e.preventDefault();

  var messageTextbox = jQuery('[name=message]');

  socket.emit(
    'createMessage',
    {
      from: 'User',
      // Get value from input field with name attribute equal to "message"
      text: messageTextbox.val()
    },
    function() {
      // Callback for acknowledgement to clear the field after sending
      messageTextbox.val('');
    }
  );
});

// Store jQuery selector to reference it multiple times
var locationButton = jQuery('#send-location');
// Add click event
locationButton.on('click', function() {
  //
  if (!navigator.geolocation) {
    return alert('Geolocation supported by your browser.');
  }

  // If geolocation button is clicked, disable button until location is sent to account for delay
  // and update its text with the status
  locationButton.attr('disabled', 'disabled').text('Sending location...');

  // Tell browser to actively get coordinates of the browser
  navigator.geolocation.getCurrentPosition(
    function(position) {
      // Re-enable geolocation button after sending location
      locationButton.removeAttr('disabled').text('Send location');
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      // If user does something like click deny
      locationButton.removeAttr('disabled').text('Send location');
      alert('Unable to fetch location.');
    }
  );
});
