<<<<<<< HEAD
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
=======
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
>>>>>>> 674e707 (fixed the announcement division for municipality)
/**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
export const center = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: center.url(args, options),
    method: 'get',
})

center.definition = {
    methods: ["get","head"],
    url: '/{municipality}/action-center',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
center.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return center.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
center.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: center.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
center.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: center.url(args, options),
    method: 'head',
})
<<<<<<< HEAD
=======

    /**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
    const centerForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: center.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
        centerForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: center.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::center
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
        centerForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: center.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    center.form = centerForm
>>>>>>> 674e707 (fixed the announcement division for municipality)
const action = {
    center: Object.assign(center, center),
}

export default action