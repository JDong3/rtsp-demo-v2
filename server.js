const express = require('express')
const promisify = require('util').promisify
const spawn = require('child_process').spawn

const exec = promisify(require('child_process').exec)
const bodyParser = require('body-parser')
const fs = require('fs').promises
const rimraf = require('rimraf')

let ffmpeg = false

// promisified rimraf
const rimrafp = (path) => {
  return new Promise((resolve, reject) => {
    try {
      rimraf(path, () => {
        resolve(true)
      })
    } catch (e) {
      console.log(e)
    }

  })
}

// promisified settimeout
const setTimeoutp = (func, time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      func()
      resolve(true)
    }, time)
  })
}

const app = express()
const port = 3001
const path = require('path')

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/video')))

app.post('/load', (req, res) => {
  console.clear()
  console.log(req.body)

  console.log('checking if /video exists')


  let stuff = async () => {

    try { // folder exists
      if (ffmpeg !== false) {
        console.log('killed')
        ffmpeg.kill()
      }
      console.log(await fs.stat(path.join(__dirname, '/video')))
      await rimrafp(path.join(__dirname, '/video'))
      console.log('folder exists, removing it')
    } catch (e) { // folder doesn't exist
      console.log(e)
      console.log('no such folder /video')
    }

    // mkdir
    await fs.mkdir(path.join(__dirname, '/video'))


    // let ffmpeg = spawn(`ffmpeg`)
    ffmpeg = spawn('ffmpeg', [
      '-i', `${req.body.url}`, '-y', '-s', '480x270',
        '-c:v', 'libx264', '-b:v', '80000', '-hls_time', '5',
        '-hls_list_size', '5', '-start_number', '1',
         `${path.join(__dirname, '/video/playlist.m3u8')}`
    ])

    ffmpeg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.error(`stdout: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

  }

  stuff()
})

app.get('/videoReady', (req, res) => {

  const checkIfReady = async () => {
    let isReady
    try {
      await fs.stat(path.join(__dirname, '/video/playlist.m3u8'))
      isReady = true
    } catch (e) {
      isReady = false
    }
    return isReady
  }
  checkIfReady().then(isReady => {
    res.setHeader('Content-Type', 'application/json')
    res.status(200)
    res.send(JSON.stringify({isReady}))
  })


})

app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, '/video/playlist.m3u8'))
})

app.listen(port, () => {
  console.log('started')
})
