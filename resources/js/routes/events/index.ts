import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
 */
export const fetch = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})

fetch.definition = {
    methods: ["get","head"],
    url: '/api/events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
 */
fetch.url = (options?: RouteQueryOptions) => {
    return fetch.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
 */
fetch.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
 */
fetch.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetch.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
 */
    const fetchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fetch.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
 */
        fetchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetch.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:48
 * @route '/api/events'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:19
 * @route '/api/events'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:19
 * @route '/api/events'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:19
 * @route '/api/events'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:19
 * @route '/api/events'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:19
 * @route '/api/events'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::update
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:74
 * @route '/api/events/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/events/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::update
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:74
 * @route '/api/events/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::update
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:74
 * @route '/api/events/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::update
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:74
 * @route '/api/events/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::update
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:74
 * @route '/api/events/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:79
 * @route '/api/events/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/events/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:79
 * @route '/api/events/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:79
 * @route '/api/events/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:79
 * @route '/api/events/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:79
 * @route '/api/events/{id}'
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
const events = {
    fetch: Object.assign(fetch, fetch),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default events