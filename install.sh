#!/bin/sh

install () {
	git clone https://github.com/kintechnology/uart-ws
	sudo mv uart-ws /opt/kindo-ws
	sudo ln -s /opt/kindo-ws/kindo /usr/local/bin
}

if [ -e "/usr/local/bin/kindo" ]; then
	echo "kindo binary already installed use \n\`$ kindo\`\nto run websocket server"
else
	install
fi
