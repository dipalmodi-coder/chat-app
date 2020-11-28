const generateMessage = (username, msg) => {
    return {
        username: username, 
        text: msg,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, url) => {
    return {
        username: username, 
        url: url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation
}