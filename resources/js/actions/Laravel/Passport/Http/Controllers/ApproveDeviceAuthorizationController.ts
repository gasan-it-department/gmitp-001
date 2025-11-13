import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Passport\Http\Controllers\ApproveDeviceAuthorizationController::__invoke
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveDeviceAuthorizationController.php:24
 * @route '/oauth/device/authorize'
 */
const ApproveDeviceAuthorizationController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ApproveDeviceAuthorizationController.url(options),
    method: 'post',
})

ApproveDeviceAuthorizationController.definition = {
    methods: ["post"],
    url: '/oauth/device/authorize',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Passport\Http\Controllers\ApproveDeviceAuthorizationController::__invoke
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveDeviceAuthorizationController.php:24
 * @route '/oauth/device/authorize'
 */
ApproveDeviceAuthorizationController.url = (options?: RouteQueryOptions) => {
    return ApproveDeviceAuthorizationController.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passport\Http\Controllers\ApproveDeviceAuthorizationController::__invoke
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveDeviceAuthorizationController.php:24
 * @route '/oauth/device/authorize'
 */
ApproveDeviceAuthorizationController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ApproveDeviceAuthorizationController.url(options),
    method: 'post',
})
export default ApproveDeviceAuthorizationController