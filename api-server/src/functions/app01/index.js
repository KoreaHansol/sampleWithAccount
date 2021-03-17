const _ = require( 'lodash' )
const errRes = require( '@/util/errres' )

const page = require( './page' )
const popup = require( './popup' )

module.exports.handler = async function( event, context ) {
  if( !event.header || !event.path ) {
    return ''
  }

  const eventSnapShot = JSON.stringify( event, null, 2 )

  try {
    let section = event.path.section
    section = section ? section.toLowerCase() : section

    if( section === 'page' ) {
      return await page.handler( event, context )
    } else if( section === 'popup' ) {
      return await popup.handler( event, context )
    } else {
      throw new Error( 'Invalid Section' )
    }
  } catch( err ) {
    return errRes( err, eventSnapShot )
  }
}

module.exports.dev = {
  url : '/app01/:section/:comp/:method',
  method: 'get,post'
}
