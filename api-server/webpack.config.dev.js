const _ = require( 'lodash' )
const fs = require( 'fs' )
const path = require( 'path' )
const webpack = require( 'webpack' )

let singleName = process.env.single

const rootDir = './src/functions'

const funcList = readAtDir( rootDir )
const funcMap = _.reduce( funcList, ( map, info ) => {
  map[info.name] = info.filePath
  return map
}, {} )

function readAtDir( dirPath ) {
  let items = fs.readdirSync( dirPath, { withFileTypes : true } )
  let funcList = _.chain( items )
    .filter( item => !item.name.startsWith( '.' ) )
    .filter( item => ( item.isDirectory() && item.name.startsWith( '@' ) ) ||
                     ( !singleName && !item.name.startsWith( '_' ) ) ||
                     ( singleName && item.name.startsWith( singleName ) ) )
    .flatMap( item => {
      if( item.isDirectory() ) {
        if( item.name.startsWith( '@' ) ) {
          return readAtDir( path.join( dirPath, item.name ) )
        } else {
          return [ {
            name : item.name,
            filePath : path.resolve( __dirname, path.join( dirPath, item.name, 'index.js' ) )
          } ]
        }
      } else {
        let fp = path.resolve( __dirname, path.join( dirPath, item.name ) )
        let pfp = path.parse( fp )
        return [ {
          name : pfp.name,
          filePath : fp
        } ]
      }
    })
    .value()

  return funcList
}

module.exports = {
  mode: 'development',
  target : 'node',
  resolve: {
    extensions: ['.js', '.json'],
    modules: [ path.resolve( __dirname, 'node_modules' ) ],
    alias: {
      '@': path.resolve( __dirname, 'src' )
    }
  },
  externals : {
    "amqplib": "amqplib",
    "aws-sdk": "aws-sdk",
    "axios": "axios",
    "bcryptjs": "bcryptjs",
    "jsonwebtoken": "jsonwebtoken",
    "lodash": "lodash",
    "moment": "moment",
    "mysql": "mysql",
    "redis": "redis",
    "redlock": "redlock",
    'hiredis': 'hiredis' //node-redis에서 hiredis를 참조하는데 이것이 webpack 에러 발생시킴, 따라서 무시
  },
  entry: funcMap,
  output: {
    path: path.resolve( __dirname, './devrun' ),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    
  },
  devtool : 'eval', //이것이 없으면 mysql 모듈에서 에러남
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ]
}
