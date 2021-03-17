const _ = require( 'lodash' )

module.exports = function( err, event ) {
  console.log( '----- Error Message -----\r\n', err, '\r\n----- Input Data -----\r\n', event )
  
  let msg = err.message ? err.message : '' + err

  if( _.includes( msg, 'Invalid Id' ) ) {
    return {
      code : 1001,
      message : msg
    }
  } else if( _.includes( msg, 'Invalid Token' ) ) {
    throw err
  } else {
    return {
      code : 500,
      message : 'Smallbee Error'
    }
  }
}
