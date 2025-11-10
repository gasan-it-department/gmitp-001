import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\External\Api\Controllers\Auth\CreateUserController::store
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/store-account',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Auth\CreateUserController::store
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Auth\CreateUserController::store
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\Auth\CreateUserController::store
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Auth\CreateUserController::store
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const user = {
    store: Object.assign(store, store),
}

export default user