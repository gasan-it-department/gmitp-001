import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})