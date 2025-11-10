import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import admin from './admin'
/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/bulletin-board/events'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/bulletin-board/events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/bulletin-board/events'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/bulletin-board/events'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/bulletin-board/events'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\BulletinBoard\EventController::store
 * @see app/External/Api/Controllers/BulletinBoard/EventController.php:15
 * @route '/bulletin-board/events'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const events = {
    admin: Object.assign(admin, admin),
store: Object.assign(store, store),
}

export default events