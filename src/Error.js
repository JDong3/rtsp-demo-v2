import {
  makeStyles,
} from '@material-ui/core'

const useStyles = makeStyles(() => (
  {
    errorText: {
      fontFamily: 'sans-serif',
      size: '14px',
      color: 'red',
      marginTop: '3px',
      marginBottom: '6px',
      marginLeft: '1%',
    }
  }
))

const Error = () => {
  const classes = useStyles()
  return (
    <div className={classes.errorText}>Instances must be a number between 1 and 8 inclusive.</div>
  )
}

export default Error
