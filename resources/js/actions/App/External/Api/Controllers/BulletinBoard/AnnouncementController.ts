import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
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
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
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
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
 * @route '/{municipality}/bulletin-board/announcement'
 */
    const indexForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
 * @route '/{municipality}/bulletin-board/announcement'
 */
        indexForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:49
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
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
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
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
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
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
show.get = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
show.head = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
    const showForm = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
        showForm.get = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:67
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
        showForm.head = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:21
 * @route '/{municipality}/bulletin-board/announcement'
 */
export const store = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{municipality}/bulletin-board/announcement',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:21
 * @route '/{municipality}/bulletin-board/announcement'
 */
store.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:21
 * @route '/{municipality}/bulletin-board/announcement'
 */
store.post = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:21
 * @route '/{municipality}/bulletin-board/announcement'
 */
    const storeForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:21
 * @route '/{municipality}/bulletin-board/announcement'
 */
        storeForm.post = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
export const update = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/{municipality}/bulletin-board/announcement/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
update.url = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
update.put = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::update
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:72
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
    const updateForm = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
        updateForm.put = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/{municipality}/bulletin-board/announcement/{$id}/publish'
 */
export const publish = (args: { municipality: string | number, $id: string | number } | [municipality: string | number, $id: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

publish.definition = {
    methods: ["patch"],
    url: '/{municipality}/bulletin-board/announcement/{$id}/publish',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
 * @route '/{municipality}/bulletin-board/announcement/{$id}/publish'
 */
publish.url = (args: { municipality: string | number, $id: string | number } | [municipality: string | number, $id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    municipality: args[0],
                    $id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        municipality: args.municipality,
                                $id: args.$id,
                }

    return publish.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace('{$id}', parsedArgs.$id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
 * @route '/{municipality}/bulletin-board/announcement/{$id}/publish'
 */
publish.patch = (args: { municipality: string | number, $id: string | number } | [municipality: string | number, $id: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:141
 * @route '/{municipality}/bulletin-board/announcement/{$id}/publish'
 */
    const publishForm = (args: { municipality: string | number, $id: string | number } | [municipality: string | number, $id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/{municipality}/bulletin-board/announcement/{$id}/publish'
 */
        publishForm.patch = (args: { municipality: string | number, $id: string | number } | [municipality: string | number, $id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
export const destroy = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{municipality}/bulletin-board/announcement/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
destroy.url = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
destroy.delete = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::destroy
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:107
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
    const destroyForm = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/{municipality}/bulletin-board/announcement/{id}'
 */
        destroyForm.delete = (args: { municipality: string | number, id: string | number } | [municipality: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const AnnouncementController = { index, show, store, update, publish, destroy }

export default AnnouncementController