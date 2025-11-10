import AnnouncementController from './AnnouncementController'
import EventController from './EventController'
const BulletinBoard = {
    AnnouncementController: Object.assign(AnnouncementController, AnnouncementController),
EventController: Object.assign(EventController, EventController),
}

export default BulletinBoard