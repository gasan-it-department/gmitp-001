import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
export const options = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: options.url(options),
    method: 'get',
})

options.definition = {
    methods: ["get","head"],
    url: '/action-center/assistance-options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
options.url = (options?: RouteQueryOptions) => {
    return options.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
options.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: options.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
options.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: options.url(options),
    method: 'head',
})
const assistance = {
    options: Object.assign(options, options),
}

export default assistance