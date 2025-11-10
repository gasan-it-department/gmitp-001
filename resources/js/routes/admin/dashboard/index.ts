import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::show
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::show
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::show
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::show
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})
const dashboard = {
    show: Object.assign(show, show),
}

export default dashboard