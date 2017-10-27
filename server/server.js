// Use Node.js built-in module "path" to build cleaner paths between "server" & "public" directories
const path = require('path');
// Instead of letting Express.js behind the scenes use of Node.js "http" module, we'll use it directly
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
// "createServer" is what Express calls in its "listen" method
// Instead of req,res callback, pass Express app to "createServer"--Express
const server = http.createServer(app);
// Websocket server
const io = socketIO(server);
// Create instance of users to manipulate sidebar list of users in room
const users = new Users();

app.use(express.static(publicPath));

// Register an event listener for server-wide events,
// and pass it "connection" to listen for a new connection, i.e. new user.
// Only this "connection" event gets to be attached to "io"
io.on('connection', socket => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    // Validate for non-empty strings for both user name and room name
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    // Create a place for people to talk that are in the same room
    // Pass the socket.io "join" method a string with the room name
    socket.join(params.room);

    // Make sure to remove user from any previous room before adding them
    users.removeUser(socket.id);

    // Update instance of users list with new user joining the room
    users.addUser(socket.id, params.name, params.room);

    // Emit an event to everyone in the chat room to update the user list on the client for that room
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    // Sending just to the one enduser
    socket.emit(
      'newMessage',
      generateMessage('Admin', 'Welcome to the chat app')
    );

    // Broadcasting to all users, but only inside of the room joined because of to(),
    // except for this socket, i.e. all users in room except current sender--here admin
    socket.broadcast
      .to(params.room)
      .emit(
        'newMessage',
        generateMessage('Admin', `${params.name} has joined.`)
      );

    // If both are valid, don't pass any errors back
    callback();
  });

  // Listen for client's created message
  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    // Emit event to every single connection, unlike "socket.emit" which emits to a single connection
    io.emit('newMessage', generateMessage(message.from, message.text));
    // Send an acknowledgement
    callback();
  });

  socket.on('createLocationMessage', coords => {
    io.emit(
      'newLocationMessage',
      generateLocationMessage('Admin', coords.latitude, coords.longitude)
    );
  });

  socket.on('disconnect', () => {
    // Remove the user, and then update the list again
    // Store any potentially removed user--"removeUser" does return any user removed
    const user = users.removeUser(socket.id);
    // If a user was removed emit 2 events to everyone in the chat room
    if (user) {
      // Update user list
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      // Print a message
      io
        .to(user.room)
        .emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

// Instead of "app.listen" use Node.js "createServer" saved above, so that we can add socketIO support
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
