// Generates RSA key pair
const crypto = require('crypto');
const keyPair = crypto.generateKeyPairSync('rsa', {
	modulusLength: 4096,
	publicKeyEncoding: {
		type: 'pkcs1',
		format: 'pem',
	},
	privateKeyEncoding: {
		type: 'pkcs1',
		format: 'pem',
	},
});
console.log(keyPair);
