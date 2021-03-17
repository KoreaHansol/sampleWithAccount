const _ = require( 'lodash' )

const getSomeData = require( './getSomeData' )
const registerData = require( './registerData' )

module.exports.handler = async function( event, context ) {
  let method = event.path.method
  method = method ? method.toLowerCase() : method
  
  if( method === 'getsomedata') {
    return await getSomeData( event, context )
  } else if( method === 'registerdata' ) {
    return await registerData( event, context )
  } else {
    throw new Error( 'Invalid Method' )
  }
}
