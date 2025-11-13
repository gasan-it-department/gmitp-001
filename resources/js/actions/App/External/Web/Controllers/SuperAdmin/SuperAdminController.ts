import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showMunicipalityPage
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
export const showMunicipalityPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMunicipalityPage.url(options),
    method: 'get',
})

showMunicipalityPage.definition = {
    methods: ["get","head"],
    url: '/municipality/super-admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showMunicipalityPage
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
showMunicipalityPage.url = (options?: RouteQueryOptions) => {
    return showMunicipalityPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showMunicipalityPage
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
showMunicipalityPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMunicipalityPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showMunicipalityPage
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
showMunicipalityPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMunicipalityPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showDashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
export const showDashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showDashboard.url(options),
    method: 'get',
})

showDashboard.definition = {
    methods: ["get","head"],
    url: '/super-admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showDashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
showDashboard.url = (options?: RouteQueryOptions) => {
    return showDashboard.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showDashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
showDashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showDashboard.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showDashboard
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:11
 * @route '/super-admin/dashboard'
 */
showDashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showDashboard.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showCreateUsers
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
export const showCreateUsers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showCreateUsers.url(options),
    method: 'get',
})

showCreateUsers.definition = {
    methods: ["get","head"],
    url: '/super-admin/create-user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showCreateUsers
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
showCreateUsers.url = (options?: RouteQueryOptions) => {
    return showCreateUsers.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showCreateUsers
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
showCreateUsers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showCreateUsers.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::showCreateUsers
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:16
 * @route '/super-admin/create-user'
 */
showCreateUsers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showCreateUsers.url(options),
    method: 'head',
})
const SuperAdminController = { showMunicipalityPage, showDashboard, showCreateUsers }

export default SuperAdminController