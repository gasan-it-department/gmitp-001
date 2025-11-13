import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/action-center/admin/status-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:18
 * @route '/action-center/admin/status-list'
 */
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})
const requests = {
    status: Object.assign(status, status),
}

export default requests