const Cryptr = require('./lib/browser-crypter');
const crypto = require('crypto-browserify');
const { Manager } = require('socket.io-client');
const { emit, on, off, removeEventListener, removeListener } = require('./symbol');
const reservedEvents = require('./reserved-events');

module.exports = (key) => (socketParam, next) => {
	let socket, secret;
	if (!next) {
		const secretBuffer = crypto.randomBytes(64);
		secret = secretBuffer.toString('hex');
		if (!secret) throw new Error('Couldn\'t generate secret');
		const encryptedSecretBuffer = crypto.publicEncrypt(key, secretBuffer);
		const encryptedSecret = encryptedSecretBuffer.toString('hex');
		if (!encryptedSecret) throw new Error('Couldn\'t generate encryptedSecret');
		const manager = new Manager(socketParam.io.uri, { withCredentials: true });
		socketParam.disconnect();
		socket = manager.socket(socketParam.nsp, {
			auth: {
				...socketParam.io.opts.auth,
				encryptedSecret,
			},
		});
	} else {
		socket = socketParam;
		if (!socket.handshake.auth || !socket.handshake.auth.encryptedSecret) throw new Error('encryptedSecret missing in handshake');
		const encryptedSecretBuffer = Buffer.from(socket.handshake.auth.encryptedSecret, 'hex');
		const decryptedSecretBuffer = crypto.privateDecrypt(key, encryptedSecretBuffer);
		secret = decryptedSecretBuffer.toString('hex');
		if (!secret) throw new Error('Failed to decrypt secret');
	}
	const handlers = new WeakMap();
	const cryptr = new Cryptr(secret);

	const encrypt = args => {
		const encrypted = [];
		let ack;
		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			if (i === args.length - 1 && typeof arg === 'function') {
				ack = arg;
			} else {
				encrypted.push(cryptr.encrypt(JSON.stringify(arg)));
			}

		}
		if (!encrypted.length) return args;
		args = [{ encrypted }];
		if (ack) args.push(ack);
		return args;
	};

	const decrypt = encrypted => {
		try {
			return encrypted.map(a => JSON.parse(cryptr.decrypt(a)));
		} catch (e) {
			const error = new Error(`Couldn't decrypt. Wrong secret used on client or invalid data sent. (${e.message})`);
			error.code = 'ERR_DECRYPTION_ERROR';
			throw error;
		}
	};

	socket[emit] = socket.emit;
	socket[on] = socket.on;
	socket[off] = socket.off;
	socket[removeEventListener] = socket.removeEventListener;
	socket[removeListener] = socket.removeListener;

	socket.emit = (event, ...args) => {
		if (reservedEvents.includes(event)) return socket[emit](event, ...args);

		return socket[emit](event, ...encrypt(args));
	};

	socket.on = (event, handler) => {
		if (reservedEvents.includes(event)) return socket[on](event, handler);

		const newHandler = function(...args) {
			if (args[0] && args[0].encrypted) {
				try {
					args = decrypt(args[0].encrypted);
				} catch (error) {
					socket[emit]('error', error);
					return;
				}
			}
			return handler.call(this, ...args);
		};

		handlers.set(handler, newHandler);
		return socket[on](event, newHandler);
	};

	socket.off = (event, handler) => {
		if (reservedEvents.includes(event)) return socket[off](event, handler);

		const properHandler = handlers.get(handler);
		if (properHandler) {
			handlers.delete(handler);
			return socket[off](event, properHandler);
		}

		return socket[off](event, handler);
	};

	socket.removeEventListener = (event, handler) => {
		return socket.off(event, handler);
	};

	socket.removeListener = (event, handler) => {
		return socket.off(event, handler);
	};

	if (next) next();
	return socket;
};
