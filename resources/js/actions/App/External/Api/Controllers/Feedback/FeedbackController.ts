import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::index
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/feedback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::index
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::index
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::index
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::store
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/feedback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::store
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::store
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::show
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/feedback/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::show
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::show
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::show
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::update
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/feedback/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::update
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::update
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::destroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/feedback/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::destroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::destroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const FeedbackController = { index, store, show, update, destroy }

export default FeedbackController