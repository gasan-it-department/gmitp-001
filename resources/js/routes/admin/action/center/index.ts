import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::show
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/action-center/admin/request-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::show
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::show
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::show
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})
const center = {
    show: Object.assign(show, show),
}

export default center