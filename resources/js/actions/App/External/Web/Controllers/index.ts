import Auth from './Auth'
import Public from './Public'
import Admin from './Admin'
import ActionCenter from './ActionCenter'
import SuperAdmin from './SuperAdmin'
import BulletinBoard from './BulletinBoard'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
Public: Object.assign(Public, Public),
Admin: Object.assign(Admin, Admin),
ActionCenter: Object.assign(ActionCenter, ActionCenter),
SuperAdmin: Object.assign(SuperAdmin, SuperAdmin),
BulletinBoard: Object.assign(BulletinBoard, BulletinBoard),
}

export default Controllers