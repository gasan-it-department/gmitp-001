import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/action-center/request-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})
const list = {
    show: Object.assign(show, show),
}

export default list