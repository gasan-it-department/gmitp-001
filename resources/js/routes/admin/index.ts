import dashboard from './dashboard'
import actionCenter from './action-center'
import action from './action'
import admin from './admin'
import update from './update'
const admin = {
    dashboard: Object.assign(dashboard, dashboard),
actionCenter: Object.assign(actionCenter, actionCenter),
action: Object.assign(action, action),
admin: Object.assign(admin, admin),
update: Object.assign(update, update),
}

export default admin