import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
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

    /**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
    const showAdminActionCenterPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showAdminActionCenterPage.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
        showAdminActionCenterPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showAdminActionCenterPage.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::showAdminActionCenterPage
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/action-center/admin/request-list'
 */
        showAdminActionCenterPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showAdminActionCenterPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showAdminActionCenterPage.form = showAdminActionCenterPageForm
const AdminActionCenterController = { showAdminActionCenterPage }

export default AdminActionCenterController