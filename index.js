const express = require( 'express');
const { Server } = require( 'socket.io');
const http = require( 'http');
const { SerialPort } = require( "serialport");
const { ByteLengthParser } = require( '@serialport/parser-byte-length');

const options = {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
}
const port = 3000
const app = express();
const server = http.createServer(app);
const io = new Server(server, options);


(async function main() {
	class Uart {
		port = null;

		constructor() {
			this.port = new SerialPort({
				path: '/dev/ttyS0',
				baudRate: 115200
			})
		}
	}

	const uart = new Uart()
	const uartAma = new SerialPort({ path:'/dev/ttyAMA3', baudRate: 115200 });
	uart.port.on("open", () => {
		console.log("opened")
	})

	uart.port.on("error", (e) => {
		console.log(e)
	})

	io.on('connection', (socket) => {
		console.log('New user connected');

		// listen for message from user
		socket.on('uart:send', (message) => {
			console.dir(message, {dir: null})
			uart.port.write(message);
		});

		socket.on('uart:pull', async (noBytes) => {
			const res = await uart.port.read(noBytes);
			console.log("uart:pull", res);
			socket.emit("uart:pull-receive", res)
		});

		uart.port
			.pipe(new ByteLengthParser({ length: 3 }))
			.on("data", (value) => {
				console.log("event: data", ...value);
				socket.emit("uart:receive-s0", value);
			})

		uartAma
			.pipe(new ByteLengthParser({ length: 1 }))
			.on("data", (value) => {
				socket.emit("uart:receive-ama", value);
			})

		// when server disconnects from user
		socket.on('disconnect', () => {
			console.log('disconnected from user');
		});
	});

	server.listen(port);
})()
