import ActionCenterController from './ActionCenterController'
import AssistanceTypeController from './AssistanceTypeController'
import ActionCenterStatusController from './ActionCenterStatusController'
const ActionCenter = {
    ActionCenterController: Object.assign(ActionCenterController, ActionCenterController),
AssistanceTypeController: Object.assign(AssistanceTypeController, AssistanceTypeController),
ActionCenterStatusController: Object.assign(ActionCenterStatusController, ActionCenterStatusController),
}

export default ActionCenter