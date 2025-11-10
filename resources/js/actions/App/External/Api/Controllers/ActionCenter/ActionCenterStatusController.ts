import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::getStatusList
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
export const getStatusList = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStatusList.url(options),
    method: 'get',
})

getStatusList.definition = {
    methods: ["get","head"],
    url: '/action-center/admin/status-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::getStatusList
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
getStatusList.url = (options?: RouteQueryOptions) => {
    return getStatusList.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::getStatusList
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
getStatusList.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStatusList.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::getStatusList
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
getStatusList.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStatusList.url(options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::updateAssistanceStatus
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
export const updateAssistanceStatus = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateAssistanceStatus.url(args, options),
    method: 'post',
})

updateAssistanceStatus.definition = {
    methods: ["post"],
    url: '/action-center/admin/request/{assistanceId}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::updateAssistanceStatus
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
updateAssistanceStatus.url = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assistanceId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    assistanceId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assistanceId: args.assistanceId,
                }

    return updateAssistanceStatus.definition.url
            .replace('{assistanceId}', parsedArgs.assistanceId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::updateAssistanceStatus
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
updateAssistanceStatus.post = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateAssistanceStatus.url(args, options),
    method: 'post',
})
const ActionCenterStatusController = { getStatusList, updateAssistanceStatus }

export default ActionCenterStatusController