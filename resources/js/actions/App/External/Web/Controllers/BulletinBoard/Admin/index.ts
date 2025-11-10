import AnnouncementAdminController from './AnnouncementAdminController'
import EventAdminController from './EventAdminController'
const Admin = {
    AnnouncementAdminController: Object.assign(AnnouncementAdminController, AnnouncementAdminController),
EventAdminController: Object.assign(EventAdminController, EventAdminController),
}

export default Admin