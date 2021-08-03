# socket.io-encrypt

Patches `socket.emit` and and `socket.on` functions to send encrypted and decrypt messages using **[crypto-browserify]**.

In HTTPS and WSS connections, data are already encrypted in a similar manner but they are still visible in browser dev tools. My purpose of this is to hide data there.

[crypto-browserify]: https://github.com/crypto-browserify/crypto-browserify

## Install

```
npm i <Point to the cloned repo>
```

## Usage

### **`Create keys`**

Create a pair of RSA keys. Any way to generate those should work but be careful to add the new line characters. 

Best way is using nodejs crypto module. Use the [`rsa.js`](./example/util/rsa.js) file to easily generate a pair

```sh
node example/util/rsa
```
Use the public key in the client and the private key in the server

### **`client`**

```js
const io = require('socket.io-client')
const encrypt = require('socket.io-encrypt')

const socket = encrypt(PUBLIC_KEY)(io(SERVER_URL));

socket.emit('message', {/* will be encrypted */})
```

### **`server`**

```js
const encrypt = require('socket.io-encrypt')

const io = require('socket.io')({});
io.use(encrypt(PRIVATE_KEY))

io.on('connect', socket => {
	socket.on('message', data /* decrypted */ => { ... })
	socket.on('error', console.error /* handle decryption errors */)
})
```
