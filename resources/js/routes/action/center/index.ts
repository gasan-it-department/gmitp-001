import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import request from './request'
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/action-center',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::show
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})
const center = {
    show: Object.assign(show, show),
request: Object.assign(request, request),
}

export default center