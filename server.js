const express = require('express')
const promisify = require('util').promisify
const spawn = require('child_process').spawn

const exec = promisify(require('child_process').exec)
const bodyParser = require('body-parser')
const fs = require('fs').promises
const rimraf = require('rimraf')

let ffmpeg = false
let streamBuilder = false

// temp protocol
// ffmpeg converts rtsp into mp4 chunks in the video folder with format chunk_%d.mp4
// custom build the files for the hls protocol
// have a process waiting for new chunk files and converting them when available, also add
// them to the m3u8 file when done converting




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
const setTimeoutp = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
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
app.use(express.static(path.join(__dirname, '/hls-test')))

app.post('/load', (req, res) => {
  console.clear()
  console.log(req.body)

  console.log('checking if /video exists')


  let stuff = async () => {

    try { // folder exists
      if (streamBuilder !== false) {
        console.log('killed streamBuilder')
        streamBuilder.kill()
      }
      if (ffmpeg !== false) {
        console.log('killed ffmpeg')
        ffmpeg.kill()
      }
      await fs.stat(path.join(__dirname, '/video'))
      await rimrafp(path.join(__dirname, '/video'))
      console.log('folder exists, removing it')
    } catch (e) { // folder doesn't exist
      console.log(e)
      console.log('no such folder /video')
    }

    // mkdir
    await fs.mkdir(path.join(__dirname, '/video'))

    ffmpeg = spawn('ffmpeg', [
      '-i', `${req.body.url}`,
      '-rtsp_transport', 'TCP',
      '-y',
      '-s', '480x270',
      '-c:v', 'libx264',
      '-b:v', '80000',
      '-f', 'segment',
      '-segment_time', '5',
      path.join(__dirname, `/video/chunk_%d.mp4`),
    ])
    // 'ffmpeg -i rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov -rtsp_transport TCP -y -s 400x250 -c:v libx264 -b:v 800000 -f segment -segment_time 5 wow_%d.mp4'

    ffmpeg.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      // console.error(`stdout: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      // console.log(`child process exited with code ${code}`);
    });

    streamBuilder = spawn('node', ['stream-builder.js'])

    streamBuilder.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })

    streamBuilder.stderr.on('data', (data) => {
      console.error(`stdout: ${data}`)
    })

    streamBuilder.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
    })

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
  console.log('send it')
  res.sendFile(path.join(__dirname, '/video/playlist.m3u8'))
})

app.get('/videoTest', (req, res) => {
  res.sendFile(path.join(__dirname, '/hls-test/out.m3u8'))
})

app.listen(port, () => {
  console.log('started')
})
