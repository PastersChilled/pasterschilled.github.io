const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('login', (username) => {
        if (!users.includes(username)) {
            users.push(username);
        }
        socket.username = username;
        io.emit('users', users.filter(u => u !== username));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users = users.filter(u => u !== socket.username);
        io.emit('users', users);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});