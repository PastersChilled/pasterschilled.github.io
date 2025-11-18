const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];
let sockets = {};

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('login', (username) => {
        if (!users.includes(username)) {
            users.push(username);
        }
        socket.username = username;
        sockets[username] = socket;
        io.emit('users', users.filter(u => u !== username));
    });

    socket.on('sendMessage', (data) => {
        const { to, text } = data;
        const recipientSocket = sockets[to];
        if (recipientSocket) {
            recipientSocket.emit('receiveMessage', { from: socket.username, text });
        }
        // Also send to sender for display
        socket.emit('receiveMessage', { from: socket.username, text });
    });

    socket.on('call', (data) => {
        const { to } = data;
        const recipientSocket = sockets[to];
        if (recipientSocket) {
            recipientSocket.emit('incomingCall', { from: socket.username });
        }
    });

    socket.on('offer', (data) => {
        const { to, offer } = data;
        const recipientSocket = sockets[to];
        if (recipientSocket) {
            recipientSocket.emit('offer', { from: socket.username, offer });
        }
    });

    socket.on('answer', (data) => {
        const { to, answer } = data;
        const recipientSocket = sockets[to];
        if (recipientSocket) {
            recipientSocket.emit('answer', { from: socket.username, answer });
        }
    });

    socket.on('ice', (data) => {
        const { to, candidate } = data;
        const recipientSocket = sockets[to];
        if (recipientSocket) {
            recipientSocket.emit('ice', { from: socket.username, candidate });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users = users.filter(u => u !== socket.username);
        delete sockets[socket.username];
        io.emit('users', users);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});