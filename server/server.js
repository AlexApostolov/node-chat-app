// Use Node.js built-in module "path" to build cleaner paths between "server" & "public" directories
const path = require('path');
// Instead of letting Express.js behind the scenes use of Node.js "http" module, we'll use it directly
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage } = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
// "createServer" is what Express calls in its "listen" method
// Instead of req,res callback, pass Express app to "createServer"--Express
const server = http.createServer(app);
// Websocket server
const io = socketIO(server);

app.use(express.static(publicPath));

// Register an event listener for server-wide events,
// and pass it "connection" to listen for a new connection, i.e. new user.
// Only this "connection" event gets to be attached to "io"
io.on('connection', socket => {
  console.log('New user connected');

  socket.emit(
    'newMessage',
    generateMessage('Admin', 'Welcome to the chat app')
  );

  socket.broadcast.emit(
    'newMessage',
    generateMessage('Admin', 'New user joined')
  );

  // Listen for client's created message
  socket.on('createMessage', message => {
    console.log('createMessage', message);
    // Emit event to every single connection, unlike "socket.emit" which emits to a single connection
    io.emit('newMessage', generateMessage(message.from, message.text));
    // // Broadcasting to all users except for this socket, i.e. all users except admin
    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

// Instead of "app.listen" use Node.js "createServer" saved above, so that we can add socketIO support
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
