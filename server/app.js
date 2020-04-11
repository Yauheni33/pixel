const io = require("socket.io")();
const express = require('express')
const redis = require("redis");
const promisify = require('util.promisify');

const app = express();
const port = 4001;
const expressPort = 4002;


const clientRedis = redis.createClient();
const getAsync = promisify(clientRedis.get).bind(clientRedis);

const column = 100;
const line = 138;

for(let i = 0; i <= column; i++) {
  for(let j = 0; j <= line; j++) {
    clientRedis.set(`${i}${j}fill`, 0);
    clientRedis.set(`${i}${j}color`, '#ecf0f1');
  }
}

io.on('connection', (client) => {

  client.on('get board', (response) => {
    const data = JSON.parse(response);
    io.sockets.emit('testing',  response)
    clientRedis.set(`${data.row}${data.col}fill`, 1);
    clientRedis.set(`${data.row}${data.col}color`, data.color);
  })

});

app.post('/', async(req, res)  => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let array = []
  for(let i = 0; i <= column; i++) {
    array.push([])
    for(let j = 0; j <= line; j++) {
      array[i].push({
        fill: await getAsync(`${i}${j}fill`),
        color: await getAsync(`${i}${j}color`)
      })
    }
  }
  res.send(array);
})

io.listen(port);
app.listen(expressPort);
console.log('start');