const fs = require('fs').promises
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const setTimeoutp = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

const streamBuilder = async () => {
  while (true) {
    try {
      await fs.stat(path.join(__dirname, '/video'))
      break
    } catch (e) {
      console.log('waiting for /video directory')
    }
    await setTimeoutp(1000)

  }



  let index = 0
  let options = {flag: 'a+'}


  while (true) {
    let contents = ''
    let nextChunk = path.join(__dirname, `/video/chunk_${index}`)

    try {
      await fs.stat(`${nextChunk}.mp4`)
      await exec(`ffmpeg -i ${nextChunk}.mp4 -c:v libx264 -c:a aac -b:a 160k -bsf:v h264_mp4toannexb -f mpegts -crf 32 ${nextChunk}.ts`)



      if (index === 0) {
        contents += '#EXTM3U\n' + '#EXT-X-VERSION:3\n' + '#EXT-X-TARGETDURATION:30\n'
      }
      if (index >= 1) {
        contents += '#EXT-X-DISCONTINUITY\n'
      }
      contents +=  '#EXTINF:5,\n' + `chunk_${index}.ts\n`

      await fs.writeFile(path.join(__dirname, '/video/playlist.m3u8'), contents, options)
      index += 1

    } catch (e) {
      console.log(e)
      console.log(`waiting for ${nextChunk}.mp4`)
    }
    await setTimeoutp(1000)
  }
}

streamBuilder()
