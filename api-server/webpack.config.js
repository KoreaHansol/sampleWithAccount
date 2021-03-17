const _ = require( 'lodash' )
const fs = require( 'fs' )
const path = require( 'path' )
const webpack = require( 'webpack' )
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' )

let singleName = process.env.single

let nodeEnv = process.env.nodeEnv
if( nodeEnv ) {
  nodeEnv = '"' + nodeEnv + '"'
}

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
  mode: 'production',
  target : 'node',
  resolve: {
    extensions: ['.js', '.json'],
    modules: [ path.resolve( __dirname, 'node_modules' ) ],
    alias: {
      '@': path.resolve( __dirname, 'src' )
    }
  },
  externals : {
    'aws-sdk' : 'aws-sdk',
    'hiredis' : 'hiredis' //node-redis에서 hiredis를 참조하는데 이것이 webpack 에러 발생시킴, 따라서 무시
  },
  entry: funcMap,
  output: {
    path: path.resolve( __dirname, './dist' ),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    
  },
  devtool : 'eval', //이것이 없으면 mysql 모듈에서 에러남
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: nodeEnv || '"production"'
      }
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: true,
      parallel: true
    })
  ]
}
