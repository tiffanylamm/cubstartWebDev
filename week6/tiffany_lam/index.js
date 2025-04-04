const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: {type: String}
});

const messageModel = mongoose.model("Message", messageSchema);

// initialize a new instance of socket.io by passing the server (the HTTP server) object
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/messages', async function(req, res){
  res.json(await messageModel.find());
});

// listen on the connection/disconnection event for incoming sockets
io.on ('connection', async (socket) => {
  io.emit('new user joined');

  // display saved msgs from db
  const msgs = await messageModel.find(); 
  const contents = msgs.map(msg => msg.content); 
  socket.emit('display msgs', contents);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    // Save to MongoDB
    const message = new messageModel();
    message.content = msg;
    message.save().then(m => {
      io.emit('chat message', msg);
    })
  });
});

server.listen(3000, async () => {
  await mongoose.connect("mongodb+srv://tiffanylam:9HcXK8bi3yYw04cM@cluster0.njgvl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").catch(e => {
    console.log(e)
  });
  console.log('listening on *:3000');
});