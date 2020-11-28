// Array to store the users
const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user in the same room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user: user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        if (user.id === id) {
            return true;
        } 

        return false;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const result = users.find((user) => {
        if (user.id === id) {
            return true;
        }
    })

    return result;
}

const getUsersInRoom = (room) => {
    const result = users.filter((user) => {
        if (user.room === room) {
            return true;
        }
    })

    return result;
}

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
}