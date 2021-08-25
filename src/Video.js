import {
  makeStyles,
} from '@material-ui/core'

import {
  useEffect,
} from 'react'

import Hls from 'hls.js'

const useStyles = makeStyles((props) => (
  {
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

const Video = (props) => {
  const classes = useStyles()
  const {multi, id} = props

  const theme = multi ? classes.videoMulti : classes.videoOne

  useEffect(() => {
    var video = document.getElementById(id);
    var hls = new Hls()

    hls.attachMedia(video)
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      hls.loadSource('/video')
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      })
    })
  })

  return (
    <video id={id} className={theme} autoPlay muted type="application/x-mpegURL"/>
  )
}

export default Video
