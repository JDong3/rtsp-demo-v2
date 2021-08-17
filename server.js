const express = require('express')
const promisify = require('util').promisify
const exec = promisify(require('child_process').exec)
const bodyParser = require('body-parser')


const app = express()
const port = 3001
const path = require('path')

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.use(express.static(path.join(__dirname, '/public')))

app.post('/load', (req, res) => {
  console.log(req.body)
})

app.get('/video', (req, res) => {
  res.send('hi')
  // res.sendFile(path.join(__dirname, '/video/playlist.m3u8'))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
