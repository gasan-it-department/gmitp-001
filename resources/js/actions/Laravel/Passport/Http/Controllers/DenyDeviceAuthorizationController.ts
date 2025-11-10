import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Passport\Http\Controllers\DenyDeviceAuthorizationController::__invoke
 * @see vendor/laravel/passport/src/Http/Controllers/DenyDeviceAuthorizationController.php:24
 * @route '/oauth/device/authorize'
 */
const DenyDeviceAuthorizationController = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: DenyDeviceAuthorizationController.url(options),
    method: 'delete',
})

DenyDeviceAuthorizationController.definition = {
    methods: ["delete"],
    url: '/oauth/device/authorize',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Laravel\Passport\Http\Controllers\DenyDeviceAuthorizationController::__invoke
 * @see vendor/laravel/passport/src/Http/Controllers/DenyDeviceAuthorizationController.php:24
 * @route '/oauth/device/authorize'
 */
DenyDeviceAuthorizationController.url = (options?: RouteQueryOptions) => {
    return DenyDeviceAuthorizationController.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passport\Http\Controllers\DenyDeviceAuthorizationController::__invoke
 * @see vendor/laravel/passport/src/Http/Controllers/DenyDeviceAuthorizationController.php:24
 * @route '/oauth/device/authorize'
 */
DenyDeviceAuthorizationController.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: DenyDeviceAuthorizationController.url(options),
    method: 'delete',
})
export default DenyDeviceAuthorizationController