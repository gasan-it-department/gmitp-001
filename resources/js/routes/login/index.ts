import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Auth\AuthController::show
 * @see app/External/Web/Controllers/Auth/AuthController.php:10
 * @route '/login'
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