import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::create
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/action-center/request/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::create
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::create
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::create
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::edit
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/{request}/edit'
 */
export const edit = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/action-center/request/{request}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::edit
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/{request}/edit'
 */
edit.url = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        request: args.request,
                }

    return edit.definition.url
            .replace('{request}', parsedArgs.request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::edit
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/{request}/edit'
 */
edit.get = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::edit
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/action-center/request/{request}/edit'
 */
edit.head = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})
const request = {
    create: Object.assign(create, create),
edit: Object.assign(edit, edit),
}

export default request