<<<<<<< HEAD
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
=======
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/{municipality}/bulletin-board/announcement'
 */
export const index = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{municipality}/bulletin-board/announcement',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { municipality: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    municipality: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        municipality: args.municipality,
                }

    return index.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

<<<<<<< HEAD
=======
    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
 * @route '/{municipality}/bulletin-board/announcement'
 */
    const indexForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
 * @route '/{municipality}/bulletin-board/announcement'
 */
        indexForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:48
 * @route '/{municipality}/bulletin-board/announcement'
 */
        indexForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
>>>>>>> 674e707 (fixed the announcement division for municipality)
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:68
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
export const show = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{municipality}/bulletin-board/announcement/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:68
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
show.url = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    municipality: args[0],
                    id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        municipality: args.municipality,
                                id: args.id,
                }

    return show.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:68
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
show.get = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:68
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
show.head = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:50
 * @route '/api/announcement'
 */
export const fetch = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})

fetch.definition = {
    methods: ["get","head"],
    url: '/api/announcement',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:50
 * @route '/api/announcement'
 */
fetch.url = (options?: RouteQueryOptions) => {
    return fetch.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:50
 * @route '/api/announcement'
 */
fetch.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:50
 * @route '/api/announcement'
 */
fetch.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetch.url(options),
    method: 'head',
})

/**
<<<<<<< HEAD
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:24
 * @route '/api/announcement'
 */
=======
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
 */
export const fetch = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})

fetch.definition = {
    methods: ["get","head"],
    url: '/api/announcement',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
 */
fetch.url = (options?: RouteQueryOptions) => {
    return fetch.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
 */
fetch.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetch.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
 */
fetch.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetch.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
 */
    const fetchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fetch.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
 */
        fetchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetch.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::fetch
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/api/announcement'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:22
 * @route '/api/announcement'
 */
>>>>>>> 674e707 (fixed the announcement division for municipality)
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/announcement',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:24
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:22
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:24
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:22
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

<<<<<<< HEAD
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:73
=======
    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:22
 * @route '/api/announcement'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:22
 * @route '/api/announcement'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/announcement/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:73
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:73
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

<<<<<<< HEAD
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:142
=======
    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
 * @route '/api/announcement/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
 * @route '/api/announcement/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}/publish'
 */
export const publish = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

publish.definition = {
    methods: ["patch"],
    url: '/api/announcement/{id}/publish',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:142
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}/publish'
 */
publish.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return publish.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:142
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}/publish'
 */
publish.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

<<<<<<< HEAD
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:108
=======
    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
 * @route '/api/announcement/{id}/publish'
 */
    const publishForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: publish.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
 * @route '/api/announcement/{id}/publish'
 */
        publishForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: publish.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    publish.form = publishForm
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/announcement/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:108
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
<<<<<<< HEAD
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:108
=======
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
>>>>>>> 674e707 (fixed the announcement division for municipality)
 * @route '/api/announcement/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
<<<<<<< HEAD
=======

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
 * @route '/api/announcement/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
 * @route '/api/announcement/{id}'
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
>>>>>>> 674e707 (fixed the announcement division for municipality)
const AnnouncementController = { index, show, fetch, store, update, publish, destroy }

export default AnnouncementController