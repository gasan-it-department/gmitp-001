import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
export const dashboard = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/{municipality}/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
dashboard.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return dashboard.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
dashboard.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
dashboard.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
    const dashboardForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
        dashboardForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Admin\AdminDasboardController::dashboard
 * @see app/External/Web/Controllers/Admin/AdminDasboardController.php:10
 * @route '/{municipality}/admin/dashboard'
 */
        dashboardForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
const admin = {
    dashboard: Object.assign(dashboard, dashboard),
}

export default admin