import {
  makeStyles,
} from '@material-ui/core'
import clsx from 'clsx'


const useStyles = makeStyles(() => (
  {
    common: {
      fontSize: '15spx',
      fontFamily: 'sans-serif',
      marginLeft: '15px',
    },

    idle: {
      color: 'green',
    },

    loading: {
      animation: '$pulse 1s linear alternate infinite',
    },

    '@keyframes pulse': {
      '0%': {
        color: 'orange'
      },

      '100%': {
        color: 'tomato'
      }
    },

    loaded: {
      color: 'green'
    },
  }
))


const Status = (props) => {
  const classes = useStyles()
  const {idle, loading, loaded} = props
  return (
    <span>
      {idle && <span className={clsx(classes.idle, classes.common)}>Status: Idle</span>}
      {loading && <span className={clsx(classes.loading, classes.common)}>Status: Loading</span>}
      {loaded && <span className={clsx(classes.loaded, classes.common)}>Status: Loaded</span>}
    </span>
  )
}

export default Status
