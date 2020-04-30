const io = require("socket.io")();
const express = require('express')
const redis = require("redis");
const promisify = require('util.promisify');
const config = require('config')
const path = require('path')
const mongoose = require('mongoose')

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

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/', require('./routes/newCell.routes'));

io.on('connection', (client) => {

  client.on('get board', (response) => {
    const data = JSON.parse(response);
    io.sockets.emit('testing',  response)
    console.log(`${data.row}${data.col}fill`)
    clientRedis.set(`${data.row}${data.col}fill`, 1);
    clientRedis.set(`${data.row}${data.col}color`, data.color);
  })

});

(async () => {
  try {
    await mongoose.connect(config.get('mongo'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    app.listen(expressPort);
    io.listen(port);
  } catch (error) {
    console.log('Server Error', error.message)
    process.exit(1)
  }
})()

console.log('start');

exports.getAsync = getAsync;
exports.column = column;
exports.line = line;