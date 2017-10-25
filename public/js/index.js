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
  // Get the inner HTML of the script tag with id of "message-template"
  var template = jQuery('#message-template').html();
  // Store the return value as "html", pass Mustache.js the template to render, and an object of data to render
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
});

// Add event listener for newLocationMessage event
socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  // Link that will open in a new tab to avoid getting kicked out of the chat room
  jQuery('#messages').append(html);
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
