import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
export const showRegisterUserPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showRegisterUserPage.url(options),
    method: 'get',
})

showRegisterUserPage.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
showRegisterUserPage.url = (options?: RouteQueryOptions) => {
    return showRegisterUserPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
showRegisterUserPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showRegisterUserPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
showRegisterUserPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showRegisterUserPage.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
    const showRegisterUserPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showRegisterUserPage.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
        showRegisterUserPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showRegisterUserPage.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Auth\AuthController::showRegisterUserPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
        showRegisterUserPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showRegisterUserPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showRegisterUserPage.form = showRegisterUserPageForm
/**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
export const showLoginPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginPage.url(options),
    method: 'get',
})

showLoginPage.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
showLoginPage.url = (options?: RouteQueryOptions) => {
    return showLoginPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
showLoginPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
showLoginPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showLoginPage.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
    const showLoginPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showLoginPage.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
        showLoginPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showLoginPage.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Auth\AuthController::showLoginPage
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
        showLoginPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showLoginPage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showLoginPage.form = showLoginPageForm
const AuthController = { showRegisterUserPage, showLoginPage }

export default AuthController