import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import admin from './admin'
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
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
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
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
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/{municipality}/bulletin-board/announcement'
 */
index.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

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
const announcement = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
admin: Object.assign(admin, admin),
}

export default announcement