const _ = require( 'lodash' )
const dbTran = require( '@/util/mysqldb' )

module.exports = async function( event, context ) {
  const name = event.body.name
  const age = event.body.age

  return await dbTran( async function( conn ) {
    let results = await conn.query( 'INSERT INTO `mytest`.mytable ( name, age ) VALUES ( ?, ? )', [ name, age ] )
    const newInsertedId = results.insertId

    return {
      code: 200,
      message: 'success',
      payload: {
        id: newInsertedId
      }
    }
  } )
}
