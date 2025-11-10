import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
export const options = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: options.url(options),
    method: 'get',
})

options.definition = {
    methods: ["get","head"],
    url: '/action-center/assistance-options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
options.url = (options?: RouteQueryOptions) => {
    return options.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
options.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: options.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
options.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: options.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
    const optionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: options.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
        optionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: options.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::options
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
        optionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: options.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    options.form = optionsForm
const assistance = {
    options: Object.assign(options, options),
}

export default assistance