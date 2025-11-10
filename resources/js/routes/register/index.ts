import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:15
 * @route '/register'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const register = {
    show: Object.assign(show, show),
}

export default register