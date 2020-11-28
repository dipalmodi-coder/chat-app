const socket = io();
const msgButton = document.querySelector('#btnSendMessage');
const locButton = document.querySelector('#btnSendLocation');
const text = document.querySelector('#messageText');

const $messages = document.querySelector('#messages-div')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options - This is user name ans pwd query params coming from index.html
// User will join a chat room, Qs
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Capture sendClientMessage event from server to client
socket.on('sendClientMessage', (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
});

// Capture sendClientLocation event from server to client
socket.on('sendClientLocation', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    autoScroll();
});

msgButton.addEventListener('click', (event) => {
    event.preventDefault();

    // Disable button
    msgButton.setAttribute('disabled', 'disabled');

    // Event to emit, message, callback for delivery acknowledgement
    socket.emit('sendClientMessageToServer', text.value, (error) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log('Message delivered!');
        msgButton.removeAttribute('disabled');
        text.value = '';
        text.focus();
    });
});

locButton.addEventListener('click', (event) => {
    event.preventDefault();

    locButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert('Location feature is not supported by your browser!');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const locationObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    
        socket.emit('sendClientLocationToServer', locationObj, () => {
            console.log('Location shared!');
            locButton.removeAttribute('disabled');
        });
    })
});

// When user joins the room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});
