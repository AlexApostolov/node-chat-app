// Client-side
var socket = io();

// Call scrollToBottom every time a new message is added to the chat area: newMessage & newLocationMessage
function scrollToBottom() {
  // Selectors
  var messages = jQuery('#messages');
  // Select the very last list item inside "messages"
  var newMessage = messages.children('li:last-child');
  // Heights
  // Only the height of element that is visible including padding
  var clientHeight = messages.prop('clientHeight');
  // Return the number of pixels an element's content is scrolled vertically
  var scrollTop = messages.prop('scrollTop');
  // The entire height of an element including padding
  var scrollHeight = messages.prop('scrollHeight');
  // Take into account the height of a new message including its padding from stylesheet
  var newMessageHeight = newMessage.innerHeight();
  // Height of the second to last list item
  var lastMessageHeight = newMessage.prev().innerHeight();

  // If user is close to the bottom, scroll user when new message arrives
  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    // Use jQuery method to set the scroll top value to the total height of the container, in order to move to bottom
    messages.scrollTop(scrollHeight);
  }
}

// Initiate a connection request from client to server to open a websocket & keep that connection open
socket.on('connect', function() {
  // Emit an event to start the process of joining a room
  // socket.io has built in support for isolated rooms
  var params = jQuery.deparam(window.location.search);
  // Emit custom event "join" that will be listened to by the server and will recieve the data as a "params" object
  // 3rd arg is if required data is invalid, whick kicks user back to the join form
  socket.emit('join', params, function(err) {
    if (err) {
      // Can use a modal library of your choice here, user gets popup and clicks the OK button to be redirected
      alert(err);
      // Manipulate which page the user is on to redirect user to the root page
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

// Take an array of users--like what's returned by "getUser"--and update the list of users on sidebar
socket.on('updateUserList', function(users) {
  var ol = jQuery('<ol></ol>');

  // Append the user's name--safely--to the ordered list of users
  users.forEach(function(user) {
    ol.append(jQuery('<li></li>').text(user));
  });

  // Select the area in the DOM & render the updated user list by completely overwriting the old
  jQuery('#users').html(ol);
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
  scrollToBottom();
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
  scrollToBottom();
});

// Custom event listener for the message submit form
jQuery('#message-form').on('submit', function(e) {
  // Prevent default page refresh when submit button is pushed
  e.preventDefault();

  var messageTextbox = jQuery('[name=message]');

  socket.emit(
    'createMessage',
    {
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
