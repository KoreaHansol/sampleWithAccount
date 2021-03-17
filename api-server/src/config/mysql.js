const _ = require( 'lodash' )

let connectOption;

if (process.env.NODE_ENV === "production") {
  connectOption = {
    host: "prod-db-server",
    user: "smallbee",
    password: "123456789",
    connectionLimit : 1
  }
} else {
  let localConfig
  try {
    localConfig = require( '../../local.js' )
  } catch( err ) {
    localConfig = {}
  }

  connectOption = _.get( localConfig, 'mysql.connectOption',
  {
    host: "localhost",
    user: "smallbee",
    password: "smallbee",
    connectionLimit : 2
  })
}

module.exports = {
  connectOption: connectOption
}
