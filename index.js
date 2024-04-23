const express = require('express');
const socketIO = require('socket.io');
const { SerialPort } = require("serialport")
const readline = require("node:readline")
const http = require('http')

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
}

const port = 3000
const ip = "192.168.1.12"
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

(async function main() {
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

		uart.port.on("data", (value) => {
			console.log("event: data", ...value);
			socket.emit("uart:receive", value);
		})

		uartAma.on("data", (value) => {
			console.log("event ama", value);
			socket.emit("uart:receive-ama", value);
		})

		// when server disconnects from user
		socket.on('disconnect', () => {
			console.log('disconnected from user');
		});
	});

	server.listen(port)
})()

const toHex = (x) => Buffer.from(x.toString(16).padStart(2, "0"), "hex")

function decimalToHex(d, bytes = 1) {
  const max = Math.pow(2, bytes * 8);

	console.log("decimals", bytes);
  if (d < 0) {
    return Buffer.from((d + max).toString(16).padStart(bytes * 2, "0"), "hex");
  } else {
    return Buffer.from(d.toString(16).padStart(bytes * 2, "0"), "hex");
  }
}

function decimalFromHex(str, bytes = 1) {
  const max = Math.pow(2, bytes * 8);
  const b = Buffer.from(str, "hex");
  const d = b.readIntBE(0, b.length);

  if (d > max) {
    return d - max;
  } else {
    return d;
  }
}

