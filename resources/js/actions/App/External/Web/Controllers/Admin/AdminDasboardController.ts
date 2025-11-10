import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
export const showAdminDashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAdminDashboard.url(options),
    method: 'get',
})

showAdminDashboard.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
showAdminDashboard.url = (options?: RouteQueryOptions) => {
    return showAdminDashboard.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
showAdminDashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAdminDashboard.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/admin/dashboard'
 */
showAdminDashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showAdminDashboard.url(options),
    method: 'head',
})
const AdminDasboardController = { showAdminDashboard }

export default AdminDasboardController