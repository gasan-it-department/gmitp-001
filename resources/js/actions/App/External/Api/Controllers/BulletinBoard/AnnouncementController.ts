import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:46
 * @route '/bulletin-board/announcement'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/bulletin-board/announcement',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:46
 * @route '/bulletin-board/announcement'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:46
 * @route '/bulletin-board/announcement'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:46
 * @route '/bulletin-board/announcement'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:54
 * @route '/bulletin-board/announcement/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/bulletin-board/announcement/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:54
 * @route '/bulletin-board/announcement/{id}'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:54
 * @route '/bulletin-board/announcement/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::show
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:54
 * @route '/bulletin-board/announcement/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:18
 * @route '/bulletin-board/announcement'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/bulletin-board/announcement',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:18
 * @route '/bulletin-board/announcement'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::store
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:18
 * @route '/bulletin-board/announcement'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:79
 * @route '/bulletin-board/announcement/{$id}/publish'
 */
export const publish = (args: { $id: string | number } | [$id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

publish.definition = {
    methods: ["patch"],
    url: '/bulletin-board/announcement/{$id}/publish',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:79
 * @route '/bulletin-board/announcement/{$id}/publish'
 */
publish.url = (args: { $id: string | number } | [$id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { $id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    $id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        $id: args.$id,
                }

    return publish.definition.url
            .replace('{$id}', parsedArgs.$id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::publish
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:79
 * @route '/bulletin-board/announcement/{$id}/publish'
 */
publish.patch = (args: { $id: string | number } | [$id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})
const AnnouncementController = { index, show, store, publish }

export default AnnouncementController