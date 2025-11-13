import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})
const AuthenticateUserController = { login, logout }

export default AuthenticateUserController