const io = require('socket.io-client');
const encrypt = require('socket.io-encrypt');
const socket = encrypt(process.env.PUBLIC_KEY)(io(process.env.URL));
socket.on('connect', () => {
	console.log('Connected');
	socket.emit('message', { message: 'my secret message' });
});
