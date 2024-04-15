const express = require('express');
const socketIO = require('socket.io');
const { SerialPort } = require("serialport")
const readline = require("node:readline")
const http = require('http')

const toHex = (x) => Buffer.from(x.toString(16).padStart(2, "0"), "hex")

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const input = (msg = "Enter") => new Promise(resolve => rl.question(msg, value => resolve(value)))

class Uart {
	port = null;

	constructor() {
		this.port = new SerialPort({
			path: '/dev/ttyS0',
			baudRate: 115200
		})
	}

	send(args, timeout = 500) {
		const binValues = args.map(x => toHex(x))

		binValues.forEach((x) => {
			const xx = x.toString("hex")
			console.log(xx)
			
			this.port.write(x, (e) => {
				if (e)
					console.log("error", String(e))
				else
					console.log(xx || "-nil-")
			});
		})
		return new Promise((resolve, reject) => {
			resolve()
		})
	}

	clear() {
		this.send([0,0,0,0,0])
	}
}

const port = 3000
const ip = "192.168.1.12"
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

(async function main() {
	const uart = new Uart()
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
			const values = message.split(" ").map(x => +x)
			console.log(values)
			uart.send(values)
		});

		// when server disconnects from user
		socket.on('disconnect', () => {
			console.log('disconnected from user');
		});
	});

	server.listen(port)
})()
