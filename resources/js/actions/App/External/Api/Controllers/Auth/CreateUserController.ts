import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\Auth\CreateUserController::createUser
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
export const createUser = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createUser.url(options),
    method: 'post',
})

createUser.definition = {
    methods: ["post"],
    url: '/store-account',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Auth\CreateUserController::createUser
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
createUser.url = (options?: RouteQueryOptions) => {
    return createUser.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Auth\CreateUserController::createUser
 * @see app/External/Api/Controllers/Auth/CreateUserController.php:23
 * @route '/store-account'
 */
createUser.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createUser.url(options),
    method: 'post',
})
const CreateUserController = { createUser }

export default CreateUserController