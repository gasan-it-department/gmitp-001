import Passport from './Passport'
import Sanctum from './Sanctum'
const Laravel = {
    Passport: Object.assign(Passport, Passport),
Sanctum: Object.assign(Sanctum, Sanctum),
}

export default Laravel