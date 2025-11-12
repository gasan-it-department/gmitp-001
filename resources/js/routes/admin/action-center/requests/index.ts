import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/action-center/request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::index
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:43
 * @route '/action-center/request'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:28
 * @route '/action-center/request'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/action-center/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:28
 * @route '/action-center/request'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:28
 * @route '/action-center/request'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:28
 * @route '/action-center/request'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:28
 * @route '/action-center/request'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
export const show = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/action-center/request/{request}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
show.url = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{request}', parsedArgs.request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
show.get = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
show.head = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
    const showForm = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
        showForm.get = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::show
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:61
 * @route '/action-center/request/{request}'
 */
        showForm.head = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
export const update = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/action-center/request/{request}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
update.url = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{request}', parsedArgs.request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
update.put = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
update.patch = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
    const updateForm = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
        updateForm.put = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:73
 * @route '/action-center/request/{request}'
 */
        updateForm.patch = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:116
 * @route '/action-center/request/{request}'
 */
export const destroy = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/action-center/request/{request}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:116
 * @route '/action-center/request/{request}'
 */
destroy.url = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{request}', parsedArgs.request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:116
 * @route '/action-center/request/{request}'
 */
destroy.delete = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:116
 * @route '/action-center/request/{request}'
 */
    const destroyForm = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:116
 * @route '/action-center/request/{request}'
 */
        destroyForm.delete = (args: { request: string | number } | [request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const requests = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default requests