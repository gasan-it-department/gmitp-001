import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/my-account',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const account = {
    show: Object.assign(show, show),
}

export default account