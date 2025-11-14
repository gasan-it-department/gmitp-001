import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
export const fetch = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})

fetch.definition = {
    methods: ["get","head"],
    url: '/api/action-center',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
fetch.url = (options?: RouteQueryOptions) => {
    return fetch.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
fetch.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
fetch.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetch.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
    const fetchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fetch.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
        fetchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetch.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetch
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:35
 * @route '/api/action-center'
 */
        fetchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetch.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    fetch.form = fetchForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
export const fetchMine = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetchMine.url(options),
    method: 'get',
})

fetchMine.definition = {
    methods: ["get","head"],
    url: '/api/action-center/mine',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
fetchMine.url = (options?: RouteQueryOptions) => {
    return fetchMine.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
fetchMine.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetchMine.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
fetchMine.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetchMine.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
    const fetchMineForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fetchMine.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
        fetchMineForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetchMine.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::fetchMine
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:0
 * @route '/api/action-center/mine'
 */
        fetchMineForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetchMine.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    fetchMine.form = fetchMineForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:24
 * @route '/api/action-center'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/action-center',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:24
 * @route '/api/action-center'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:24
 * @route '/api/action-center'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:24
 * @route '/api/action-center'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::store
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:24
 * @route '/api/action-center'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:52
 * @route '/api/action-center/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/action-center/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:52
 * @route '/api/action-center/{id}'
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
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:52
 * @route '/api/action-center/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::update
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:52
 * @route '/api/action-center/{id}'
 */
    const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:52
 * @route '/api/action-center/{id}'
 */
        updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:89
 * @route '/api/action-center/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/action-center/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:89
 * @route '/api/action-center/{id}'
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
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:89
 * @route '/api/action-center/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterController::destroy
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:89
 * @route '/api/action-center/{id}'
 */
    const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterController.php:89
 * @route '/api/action-center/{id}'
 */
        destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ActionCenterController = { fetch, fetchMine, store, update, destroy }

export default ActionCenterController