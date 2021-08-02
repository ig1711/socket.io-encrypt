const http = require('http');
const encrypt = require('socket.io-encrypt');
const server = http.createServer();
const io = require('socket.io')(server);

io.use(encrypt(process.env.PRIVATE_KEY));

server.listen(process.env.PORT, error => {
	if (error) console.error(error);
	else console.log(`Listening at ${process.env.PORT}`);
});

io.on('connect', socket => {
	console.log('Connected:', socket.id);
	socket.on('message', data => {
		console.log('Message from', socket.id, data);
	});
	socket.on('error', console.error);
});
