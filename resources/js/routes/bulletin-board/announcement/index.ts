import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
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
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/{municipality}/bulletin-board/announcement'
 */
    const indexForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
 * @route '/{municipality}/bulletin-board/announcement'
 */
        indexForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\BulletinBoard\AnnouncementController::index
 * @see app/External/Api/Controllers/BulletinBoard/AnnouncementController.php:0
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
const announcement = {
    index: Object.assign(index, index),
admin: Object.assign(admin, admin),
}

export default announcement