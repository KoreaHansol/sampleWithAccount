const _  = require( 'lodash' )
const moment = require( 'moment' )

const fs = require( 'fs' )
const path = require( 'path' )

const express = require( 'express' )
const cors = require( 'cors' )
const pathMatch = require( 'path-match' )

const webpack = require( 'webpack' )
const webpackConfig = require( './webpack.config.dev' )

const DEFAULT_PORT = 9191

const rootDir = './devrun'

let arg1 = process.argv[2]

if( arg1 === '-nowebpack' ) {
  runServer()
} else {
  console.log( 'Webpacking...' )
  webpack( webpackConfig, ( err, res ) => {
    if( err ) {
      console.log( 'Webpack Error', err )
    } else {
      console.log( 'Webpack Done' )
      runServer()
    }
  })  
}

function log( ...msgArr ) {
  let now = moment().format( 'YYYY-MM-DD HH:mm:ss' )
  console.log.apply( console, [ now, ...msgArr ] )
}

function runServer() {
  const urlPrefix = ''//'/prod'

  let localConfig
  try {
    localConfig = require( './local' )
  } catch( err ) {
    log( 'Not Exist Local.js' )
    localConfig = {}
  }

  const route = pathMatch({
    sensitive: false,
    strict: false,
    end: false
  })

  const app = express()

  app.use( cors() )
  app.use( express.json() )
  app.use( express.urlencoded() )

  log( '---routes---' )

  function readAtDir( dirPath ) {
    if( !fs.existsSync( rootDir ) ) {
      return []
    }

    let items = fs.readdirSync( dirPath, { withFileTypes : true } )
    let funcList = _.chain( items )
      .filter( item => !_.startsWith( item.name, '.' ) )
      .flatMap( item => {
        if( item.isDirectory() ) {
          if( item.name.startsWith( '@' ) ) {
            return readAtDir( path.join( dirPath, item.name ) )
          } else {
            return [ {
              name : item.name,
              filePath : path.join( dirPath, item.name, 'index.js' )
            } ]
          }
        } else {
          let fp = path.resolve( __dirname, path.join( dirPath, item.name ) )
          let pfp = path.parse( fp )
          return [ {
            name : pfp.name,
            filePath : path.join( dirPath, item.name )
          } ]
        }
      })
      .value()

    return funcList
  }

  const funcList = readAtDir( rootDir )

  _.chain( funcList )
  .sortBy( item => item.name )
  .map( item => './' + item.filePath )
  .filter( p => fs.existsSync( p ) )
  .forEach( item => {
    let func = require( item )
    if( !func.handler || !func.dev || !func.dev.url ) {
      return
    }

    let routeMatch

    let reqHandler = function( req, res ) {
      log( "=>", '(' + req.method + ')', req.path )

      let pathParam = routeMatch( req.path )

      let event = {
        header : req.headers,
        path : pathParam,
        query : req.query,
        context : {
          httpMethod : req.method,
          resourcePath : req.path.substr( urlPrefix.length )
        },
        body : req.body
      }
    
      let context = {}
    
      let isRetPromise = false
    
      let callback = function( err, resBody ) {
        if( isRetPromise ) {
          return
        }
    
        if( err ) {
          res.status( 500 )
          res.send( err )
        } else {
          res.send( resBody )
        }
      }
      
      let p = func.handler( event, context, callback )
      if( p && p.then ) {
        isRetPromise = true
    
        p.then( resBody => {
          res.send( resBody )
        }).catch( err => {
          log( err )
          if( ( '' + err ).indexOf( 'Invalid Token' ) ) {
            res.status( 403 ).send( err )
          } else {
            res.status( 500 ).send( err )
          }
        })
      }
    }

    let url = urlPrefix
    url += func.dev.url.startsWith( '/' ) ? func.dev.url : '/' + func.dev.url

    routeMatch = route( url )

    let method = func.dev.method || 'get'
    let methods = _(method).split(',').compact().map( m => m.toLowerCase() ).value()
    _.forEach( methods, m => {
      if( m === 'post' ) {
        app.post( url, reqHandler )
        log( '(POST)', url )
      } else if( m === 'head' ) {
        app.head( url, reqHandler )
        log( '(HEAD)', url )
      } else if( m === 'put' ) {
        app.put( url, reqHandler );
        log( '(PUT)', url )
      } else if( m === 'delete' ) {
        app.delete( url, reqHandler )
        log( '(DELETE)', url )
      } else if( m === 'options' ) {
        app.options( url, reqHandler )
        log( '(OPTIONS)', url )
      } else {
        app.get( url, reqHandler )
        log( '(GET) ', url )
      }
    })
  })
  .value()

  log( '---routes---\n' )

  let port = _.get( localConfig, 'devServer.port', DEFAULT_PORT )
  app.listen( port, function() {
    log( `listening on ${port}...` )
  })
}
