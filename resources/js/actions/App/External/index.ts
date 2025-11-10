import Web from './Web'
import Api from './Api'
const External = {
    Web: Object.assign(Web, Web),
Api: Object.assign(Api, Api),
}

export default External