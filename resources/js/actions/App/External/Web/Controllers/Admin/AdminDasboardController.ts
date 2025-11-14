import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
export const showAdminDashboard = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAdminDashboard.url(args, options),
    method: 'get',
})

showAdminDashboard.definition = {
    methods: ["get","head"],
    url: '/{municipality}/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
showAdminDashboard.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { municipality: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    municipality: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        municipality: args.municipality,
                }

    return showAdminDashboard.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
showAdminDashboard.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAdminDashboard.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
showAdminDashboard.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showAdminDashboard.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
    const showAdminDashboardForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showAdminDashboard.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
        showAdminDashboardForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showAdminDashboard.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::showAdminDashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
        showAdminDashboardForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showAdminDashboard.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showAdminDashboard.form = showAdminDashboardForm
const AdminDasboardController = { showAdminDashboard }

export default AdminDasboardController