## Steps to run the example

## 1. Generate keys:
```sh
node example/util/rsa
```
Copy the publicKey and privateKey values. Use the publicKey value in [`client/config.js`](./client/config.js) and the privateKey value in [`server/config.js`](./server/config.js)

## `server`
Open a new terminal and change directory to example/server and use the start script
```sh
cd example/server
npm start
```
## `client`
Open another new terminal and change directory to example/client and use the start script
```sh
cd example/client
npm start
```
