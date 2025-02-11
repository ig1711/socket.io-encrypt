// const crypto = require('crypto-browserify');
const { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } = require('crypto-browserify');

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;
const tagPosition = saltLength + ivLength;
const encryptedPosition = tagPosition + tagLength;

function Cryptr(secret) {
	if (!secret || typeof secret !== 'string') {
		throw new Error('Cryptr: secret must be a non-0-length string');
	}

	function getKey(salt) {
		return pbkdf2Sync(secret, salt, 1, 32, 'sha512');
	}

	this.encrypt = function encrypt(value) {
		if (value == null) {
			throw new Error('value must not be null or undefined');
		}

		const iv = randomBytes(ivLength);
		const salt = randomBytes(saltLength);

		const key = getKey(salt);

		const cipher = createCipheriv(algorithm, key, iv);
		const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);

		const tag = cipher.getAuthTag();

		return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
	};

	this.decrypt = function decrypt(value) {
		if (value == null) {
			throw new Error('value must not be null or undefined');
		}

		const stringValue = Buffer.from(String(value), 'hex');

		const salt = stringValue.slice(0, saltLength);
		const iv = stringValue.slice(saltLength, tagPosition);
		const tag = stringValue.slice(tagPosition, encryptedPosition);
		const encrypted = stringValue.slice(encryptedPosition);

		const key = getKey(salt);

		const decipher = createDecipheriv(algorithm, key, iv);

		decipher.setAuthTag(tag);

		return decipher.update(encrypted) + decipher.final('utf8');
	};
}

module.exports = Cryptr;
