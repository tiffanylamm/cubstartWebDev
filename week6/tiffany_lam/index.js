const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

// initialize a new instance of socket.io by passing the server (the HTTP server) object
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// listen on the connection/disconnection event for incoming sockets and log it to the console
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('set username', (username) => {
    socket.username = username;
    io.emit('chat message', `Welcome ${socket.username}!`)
  })

  // //broadcasts to evveryone but connecting user
  // socket.broadcast.emit('chat message', 'A user has connected');

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('chat message', `${socket.username} has disconnected`);
    } else {
      console.log('user disconnected');
      //broadcasts to everyone
      io.emit('chat message', 'A user has disconnected')
    }
  });

  socket.on('chat message', (msg) => {
    if (socket.username) {
      io.emit('chat message', `${socket.username}: ${msg}`)
    } else {
      io.emit('chat message', msg)
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});