import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
export const showAdminActionCenterPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAdminActionCenterPage.url(options),
    method: 'get',
})

showAdminActionCenterPage.definition = {
    methods: ["get","head"],
    url: '/action-center/admin/request-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
showAdminActionCenterPage.url = (options?: RouteQueryOptions) => {
    return showAdminActionCenterPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
showAdminActionCenterPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAdminActionCenterPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
showAdminActionCenterPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showAdminActionCenterPage.url(options),
    method: 'head',
})
const AdminActionCenterController = { showAdminActionCenterPage }

export default AdminActionCenterController