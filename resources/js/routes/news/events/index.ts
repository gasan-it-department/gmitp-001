import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/news-events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})
const events = {
    show: Object.assign(show, show),
}

export default events