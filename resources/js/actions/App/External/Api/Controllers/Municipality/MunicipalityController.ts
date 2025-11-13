import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::store
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:27
 * @route '/municipality/super-admin/add'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/municipality/super-admin/add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::store
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:27
 * @route '/municipality/super-admin/add'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::store
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:27
 * @route '/municipality/super-admin/add'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:62
 * @route '/municipality/super-admin/list'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/municipality/super-admin/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:62
 * @route '/municipality/super-admin/list'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:62
 * @route '/municipality/super-admin/list'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::index
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:62
 * @route '/municipality/super-admin/list'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::update
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:98
 * @route '/municipality/super-admin/update/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/municipality/super-admin/update/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::update
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:98
 * @route '/municipality/super-admin/update/{id}'
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
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::update
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:98
 * @route '/municipality/super-admin/update/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::indexActiveMunicipalities
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
export const indexActiveMunicipalities = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexActiveMunicipalities.url(options),
    method: 'get',
})

indexActiveMunicipalities.definition = {
    methods: ["get","head"],
    url: '/municipality',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::indexActiveMunicipalities
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
indexActiveMunicipalities.url = (options?: RouteQueryOptions) => {
    return indexActiveMunicipalities.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::indexActiveMunicipalities
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
indexActiveMunicipalities.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexActiveMunicipalities.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::indexActiveMunicipalities
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:81
 * @route '/municipality'
 */
indexActiveMunicipalities.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexActiveMunicipalities.url(options),
    method: 'head',
})
const MunicipalityController = { store, index, update, indexActiveMunicipalities }

export default MunicipalityController