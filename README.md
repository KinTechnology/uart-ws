# Kindo uart websocket service

## Docker

### How to build & push image to docker hub
```bash
docker build . -t kindo-uart-ws:[tag/version]
docker tag kindo-uart-ws:[tag/version] kintechnology/kindo-uart-ws:[tag/version]
docker push kintechnology/kindo-uart-ws:[tag/version]
```

### How to pull & run docker image
```bash
docker pull kintechnology/kindo-uart-ws:[tag/version]
docker run --name kindo-uart-ws -d p 3000:3000 kintechnology/kindo-uart-ws:[tag/version]
```

## Installation script(deprecated)
```sh
curl -L https://bit.ly/3WYEQqn | bash
```

# Build command

```sh
npm run build
```

# Run build distributable

```sh
node ./dist/uart-ws.js

```
