const _ = require( 'lodash' )

const helloWorld = require( './helloWorld' )

module.exports.handler = async function( event, context ) {
  let comp = event.path.comp
  comp = comp ? comp.toLowerCase() : comp

  if( comp === 'helloworld' ) {
    return await helloWorld.handler( event, context )
  } else {
    throw new Error( 'Invalid Component' )
  }
}
