import axios from 'axios'

export default {
  getSomeData() {
    return axios.get( 'http://localhost:9191/app01/page/helloworld/getsomedata?abcd=1' )
    .then( res => res.data )
    .then( res => {
      if( res.code !== 200 ) {
        throw res
      } else {
        return res
      }
    } )
  },
  regieterData( name, age ) {
    return axios.post( 'http://localhost:9191/app01/page/helloworld/registerdata',{
      name: name, age: age
    } ).then( res => res.data )
  }
}
