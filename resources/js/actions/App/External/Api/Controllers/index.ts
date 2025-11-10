import Auth from './Auth'
import ActionCenter from './ActionCenter'
import Municipality from './Municipality'
import Feedback from './Feedback'
import BulletinBoard from './BulletinBoard'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
ActionCenter: Object.assign(ActionCenter, ActionCenter),
Municipality: Object.assign(Municipality, Municipality),
Feedback: Object.assign(Feedback, Feedback),
BulletinBoard: Object.assign(BulletinBoard, BulletinBoard),
}

export default Controllers