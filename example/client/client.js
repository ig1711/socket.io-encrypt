const io = require('socket.io-client');
const encrypt = require('socket.io-encrypt');
const skt = io('http://localhost:3000');
const socket = encrypt(process.env.PUBLIC_KEY)(skt);
socket.on('connect', () => {
	console.log('Connected');
	socket.emit('message', { message: 'my secret message' });
});
