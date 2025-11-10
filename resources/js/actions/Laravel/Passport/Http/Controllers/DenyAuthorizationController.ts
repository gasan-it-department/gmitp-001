import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
export const deny = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deny.url(options),
    method: 'delete',
})

deny.definition = {
    methods: ["delete"],
    url: '/oauth/authorize',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
deny.url = (options?: RouteQueryOptions) => {
    return deny.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
deny.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deny.url(options),
    method: 'delete',
})
const DenyAuthorizationController = { deny }

export default DenyAuthorizationController