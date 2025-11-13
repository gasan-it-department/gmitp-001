import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Passport\Http\Controllers\AuthorizationController::authorize
 * @see vendor/laravel/passport/src/Http/Controllers/AuthorizationController.php:41
 * @route '/oauth/authorize'
 */
export const authorize = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: authorize.url(options),
    method: 'get',
})

authorize.definition = {
    methods: ["get","head"],
    url: '/oauth/authorize',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Passport\Http\Controllers\AuthorizationController::authorize
 * @see vendor/laravel/passport/src/Http/Controllers/AuthorizationController.php:41
 * @route '/oauth/authorize'
 */
authorize.url = (options?: RouteQueryOptions) => {
    return authorize.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passport\Http\Controllers\AuthorizationController::authorize
 * @see vendor/laravel/passport/src/Http/Controllers/AuthorizationController.php:41
 * @route '/oauth/authorize'
 */
authorize.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: authorize.url(options),
    method: 'get',
})
/**
* @see \Laravel\Passport\Http\Controllers\AuthorizationController::authorize
 * @see vendor/laravel/passport/src/Http/Controllers/AuthorizationController.php:41
 * @route '/oauth/authorize'
 */
authorize.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: authorize.url(options),
    method: 'head',
})
const AuthorizationController = { authorize }

export default AuthorizationController