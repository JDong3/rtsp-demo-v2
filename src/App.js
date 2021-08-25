import {
  Paper,
  Container,
  makeStyles,
  TextField,
  Button,
} from '@material-ui/core'
import clsx from 'clsx'
import Video from './Video.js'
import Status from './Status.js'
import {
  useState,
} from 'react'
import Error from './Error.js'

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

    placeholder: {
      background: 'grey',
    },
  }
))

const App = () => {

  const classes = useStyles()
  const [instances, setInstances] = useState(1)
  const [instancesField, setInstancesField] = useState('')
  const [urlField, setUrlField] = useState('')
  const [stage, setStage] = useState('default') // default, loading, loaded
  const [failedCheck, setFailedCheck] = useState(false)


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

    let maybeInstances = 1
    try {
      maybeInstances = parseInt(instancesField)
    } catch (e) {
      setFailedCheck(true)
      return
    }

    if (maybeInstances < 1 || maybeInstances > 8) {
      setFailedCheck(true)
      return
    }

    const trigger = async () => {
      let body = {
        url: urlField,
      }
      await fetch('/load', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      })
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
      setStage('loaded')
    }
    trigger()
    setStage('loading')
    setInstances(maybeInstances)
    setFailedCheck(false)
    pollVideo()

  }

  const handleInstancesField = (event) => {
    setInstancesField(event.target.value)
  }

  const handleUrlField = (event) => {
    setUrlField(event.target.value)
  }

  const renderVideo = () => {
    if (instances === 1) {
      return <Video id="video"/>
    } else {
      return Array(instances).fill(0).map((element, i) => (
        <Video multi id={`video_${i}`} key={i}/>
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
          {failedCheck && <Error/>}
          <Button className={classes.button} disableElevation color="primary" variant="contained" onClick={handleLoad}>Load</Button>
          {stage === 'default' && <Status idle/>}
          {stage === 'loading' && <Status loading/>}
          {stage === 'loaded' && <Status loaded/>}
        </div>
        <div id="videos">
          {stage === 'loaded' && renderVideo()}
        </div>

      </Paper>
    </Container>
  );
}

export default App;
