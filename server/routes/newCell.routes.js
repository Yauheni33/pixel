const { Router } = require('express')
const data = require('../app');
const router = Router()

router.post('/', async (req, res)  => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let array = []
  for(let i = 0; i <= data.column; i++) {
    array.push([])
    for(let j = 0; j <= data.line; j++) {
      array[i].push({
        fill: await data.getAsync(`${i}${j}fill`),
        color: await data.getAsync(`${i}${j}color`)
      })
    }
  }
  res.send(array);
})

module.exports = router