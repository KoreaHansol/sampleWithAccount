import axios from 'axios'

export default {
  getAnyData() {
    return axios.get( 'http://localhost:9191/app01/popup/showdata/getanydata' )
  }
}
