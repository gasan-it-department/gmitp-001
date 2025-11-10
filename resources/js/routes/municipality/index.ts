import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import superAdmin from './super-admin'
/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/municipality',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const municipality = {
    superAdmin: Object.assign(superAdmin, superAdmin),
index: Object.assign(index, index),
}

export default municipality