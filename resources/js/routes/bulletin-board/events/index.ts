import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import admin from './admin'
/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/{municipality}/bulletin-board/events'
 */
export const store = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{municipality}/bulletin-board/events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/{municipality}/bulletin-board/events'
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
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/{municipality}/bulletin-board/events'
 */
store.post = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})
const events = {
    admin: Object.assign(admin, admin),
store: Object.assign(store, store),
}

export default events