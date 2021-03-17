const _ = require( 'lodash' )
const dbTran = require( '@/util/mysqldb' )

module.exports = async function( event, context ) {
  return await dbTran( async function( conn ) {
    let results = await conn.query( 'select * from `mytest`.mytable' )
    const list = conn.resultsAsCamelCase( results )

    return {
      code: 200,
      message: 'success',
      payload: list
    }
  } )  
}
