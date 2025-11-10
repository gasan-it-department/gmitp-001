import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/services',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
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
const services = {
    show: Object.assign(show, show),
}

export default services