import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
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
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
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

    /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
const AuthenticateUserController = { login, logout }

export default AuthenticateUserController