import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::page
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/municipality/super-admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::page
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::page
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\SuperAdmin\SuperAdminController::page
 * @see app/External/Web/Controllers/SuperAdmin/SuperAdminController.php:21
 * @route '/municipality/super-admin'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::add
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:27
 * @route '/municipality/super-admin/add'
 */
export const add = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/municipality/super-admin/add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::add
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:27
 * @route '/municipality/super-admin/add'
 */
add.url = (options?: RouteQueryOptions) => {
    return add.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Municipality\MunicipalityController::add
 * @see app/External/Api/Controllers/Municipality/MunicipalityController.php:27
 * @route '/municipality/super-admin/add'
 */
add.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
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
const superAdmin = {
    page: Object.assign(page, page),
add: Object.assign(add, add),
index: Object.assign(index, index),
update: Object.assign(update, update),
}

export default superAdmin