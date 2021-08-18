import {
  Paper,
  Container,
  makeStyles,
  TextField,
  Button,
} from '@material-ui/core'
import clsx from 'clsx'
import {
  useEffect,
  useState,
} from 'react'
import Hls from 'hls.js'


const useStyles = makeStyles(() => (
  {
    paper: {
      height: '80vh',
      marginTop: '8vh',
      overflow: 'auto',
      scrollbarWidth: 'thin',
    },

    urlField: {
      width: '98%',
      marginLeft: '1%',
    },

    fieldMargin: {
      marginBottom: '6px',
    },

    button: {
      marginLeft: '1%',
      marginBottom: '15px',
    },

    videoOne: {
      marginLeft: '1%',
      width: '98%',
    },

    videoMulti: {
      width: '48.5%',
      marginLeft: '1%',
      marginBottom: '10px',
    },
  }
))

const App = () => {

  const classes = useStyles()
  const [instances, setInstances] = useState(1)
  const [instancesField, setInstancesField] = useState('')
  const [urlField, setUrlField] = useState('')

  const setTimeoutp = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, time)
    })
  }

  const handleLoad = (event) => {
    /**
     * when load is pressed, the server starts transcoding stuff, the instances variable is also set
     */
    const trigger = async () => {
      let body = {
        url: urlField,
      }
      await fetch('/load', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      })
      console.log('loaded')
    }

    const pollVideo = async () => {
      while (true) {
        await setTimeoutp(1000)
        let data = await fetch('/videoReady')
        data = await data.json()
        if (data.isReady === true) {
          break
        }
      }

      if (Hls.isSupported()) {
        var videos = document.getElementById('videos').childNodes;

        videos.forEach(video => {
          var hls = new Hls()
          hls.attachMedia(video)
          hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource('/video')
            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            })
          })
        })
      }



    }
    console.log('clicked hello')
    trigger()
    setInstances(parseInt(instancesField))
    pollVideo()

  }

  const handleInstancesField = (event) => {
    setInstancesField(event.target.value)
  }

  const handleUrlField = (event) => {
    setUrlField(event.target.value)
  }

  useEffect(() => {

  }, [])

  const renderVideos = () => {
    if (instances === 1) {
      return <video id="video" className={classes.videoOne} autoPlay muted type="application/x-mpegURL">
      </video>
    } else {
      return Array(instances).fill(0).map((element, i) => (
        <video className={classes.videoMulti} key={i} autoPlay muted type="application/x-mpegURL">
        </video>
      ))
    }
  }

  return (
    <Container maxWidth="md">
      <Paper className={classes.paper}>
        <div>
          <TextField className={classes.urlField} label="rtsp://" onChange={handleUrlField}>
          </TextField>
          <TextField className={clsx(classes.urlField, classes.fieldMargin)} label="instances" onChange={handleInstancesField}>
          </TextField>
          <Button className={classes.button} disableElevation color="primary" variant="contained" onClick={handleLoad}>Load</Button>
        </div>
        <div id="videos">
          {renderVideos()}
        </div>

      </Paper>
    </Container>
  );
}

export default App;
