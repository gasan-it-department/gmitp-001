import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
export const index = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{municipality}/action-center/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
index.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
index.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
index.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
    const indexForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
        indexForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\ActionCenter\Admin\AdminActionCenterController::index
 * @see app/External/Web/Controllers/ActionCenter/Admin/AdminActionCenterController.php:10
 * @route '/{municipality}/action-center/admin'
 */
        indexForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
const AdminActionCenterController = { index }

export default AdminActionCenterController