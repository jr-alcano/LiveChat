//imports
const express = require('express') 
const http = require('http') 
const socketio = require('socket.io') 
const cors = require('cors');



const app = express() //creates express application
const server = http.createServer(app) //creates http server that listens to requests with the express application

const io = socketio(server, { //creates an instance of the socket server that uses the express http server
    cors: {
      origin: "http://localhost:3000",  // Allow frontend origin
      methods: ["GET", "POST"],  // Specify which HTTP methods are allowed
      credentials: true  // Allow cookies and HTTP authentication
    }
  });

app.use(cors());

const getRandomName = () => { //function to use random names to when user connects, fill in for possible login function later
    const names = ["Ray", "John", "Bella", "Alice", "Mike"];
    return names[Math.floor(Math.random() * names.length)];
};

io.on('connection', (socket) => { //listener event for the SocketIO server waiting for a 'connection'
    console.log(`User connected: ${socket.id}`);
    const userName = getRandomName();
    const userId = socket.id; // Socket.IO automatically assigns a unique ID to each connection

    // Notify all clients about the new connection
    io.emit('user connected', { userId, userName });


    //currently no disconnects are implemented on app.js
    socket.on('disconnect', () => { //listerner event on a specific client socket waiting for a disconnect
        io.emit('user disconnected', { userId, userName });
    });

    // Handle incoming messages
    socket.on('chat message', (msg) => {
        console.log('Broadcasting message:', msg);
        io.emit('chat message', { userId, userName, msg });
    });
});

//running server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

