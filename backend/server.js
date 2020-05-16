const http = require('http');
const webSocketServer = require('websocket').server;
const PORT = 8000;
const { v4: uuidv4 } = require('uuid');
const originIsAllowed = (origin) => {
  // put logic here to detect whether the specified origin is allowed.
  console.log(origin)
  return true;
}

const server = http.createServer();
const wsServer = new webSocketServer({
  httpServer: server
});

const clientList = {}
let text = ""
const broadcastAll = (message) => {
  text = message.utf8Data
  for (const client of Object.values(clientList)) {
    client.sendUTF(text)
  }
}
wsServer.on('request', request => {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  const connection = request.accept('echo-protocol', request.origin);
  connection.sendUTF(text)
  clientList[uuidv4()] = connection

  connection.on('message', function (message) {
    console.log(message)
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      // connection.sendUTF(message.utf8Data);
      broadcastAll(message)
    } else {
      console.log('invalid message received')
    }
  });

  connection.on('close', function (reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });

})

server.listen(PORT);