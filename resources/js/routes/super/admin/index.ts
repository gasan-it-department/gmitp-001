import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::dashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/super-admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::dashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::dashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::dashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::createUser
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
export const createUser = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createUser.url(options),
    method: 'get',
})

createUser.definition = {
    methods: ["get","head"],
    url: '/super-admin/create-user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::createUser
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
createUser.url = (options?: RouteQueryOptions) => {
    return createUser.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::createUser
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
createUser.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createUser.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::createUser
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
createUser.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createUser.url(options),
    method: 'head',
})
const admin = {
    dashboard: Object.assign(dashboard, dashboard),
createUser: Object.assign(createUser, createUser),
}

export default admin