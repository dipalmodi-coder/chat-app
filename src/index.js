// Requires path module from NodeJS
const path = require('path');

// Require http
const http = require('http');

// Requires express library
const express = require('express');

// Requires socket.io
const socketio = require('socket.io');

// Create an app variable with express function.
// Use the app variable to call various express features.
const app = express();

const Filter = require('bad-words');

// Use ES6 destruct
const { generateLocation, generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// Heroku will assign value to this env. variable
// Or default value as 3000
const port = process.env.PORT || 3000;

// Set up path configs for public and views folders
const publicDirectoryPath = path.join(__dirname, '../public');

// Instruct app to use static files from a dir.
app.use(express.static(publicDirectoryPath));

const server = http.createServer(app);

// For web sockets we need server to pass in the socketio function
// Thats why we need to create both express app and server through http createServer
const io = socketio(server);

// This event fires every time a new client - browser vists chat app
io.on('connection', (socket) => {
    socket.emit('sendClientMessage', generateMessage('Admin', "Welcome to my new chat app!"));

    socket.on('sendClientMessageToServer', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Dont you use profanity!! Clean your message and try again.');
        }

        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('sendClientMessage', generateMessage(user.username, message));
        }

        callback();
    });

    socket.on('sendClientLocationToServer', (location, callback) => {
        let url = `https://google.com/maps?q=${location.latitude},${location.longitude}`;

        const user = getUser(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit('sendClientLocation', generateLocation(user.username, url));
        }

        // Call the callback function, so that client is notified.
        callback();
    });

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username: username, room: room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room)

        socket.emit('sendClientMessage', generateMessage('Admin', `Welcome ${user.username}!`));
        socket.broadcast.to(user.room).emit('sendClientMessage', generateMessage('Admin', `${user.username} has joined!`));

        // Emit a new event for the side bar user list
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('sendClientMessage', generateMessage('Admin', `${user.username} has left!`))
            // Emit a new event for the side bar user list
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });

        }
    })

});

// Start the server
server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});