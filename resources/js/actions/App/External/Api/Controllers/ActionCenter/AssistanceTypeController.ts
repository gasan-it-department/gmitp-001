import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::assistanceTypesSelect
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
export const assistanceTypesSelect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assistanceTypesSelect.url(options),
    method: 'get',
})

assistanceTypesSelect.definition = {
    methods: ["get","head"],
    url: '/action-center/assistance-options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::assistanceTypesSelect
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
assistanceTypesSelect.url = (options?: RouteQueryOptions) => {
    return assistanceTypesSelect.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::assistanceTypesSelect
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
assistanceTypesSelect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assistanceTypesSelect.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\ActionCenter\AssistanceTypeController::assistanceTypesSelect
 * @see app/External/Api/Controllers/ActionCenter/AssistanceTypeController.php:16
 * @route '/action-center/assistance-options'
 */
assistanceTypesSelect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: assistanceTypesSelect.url(options),
    method: 'head',
})
const AssistanceTypeController = { assistanceTypesSelect }

export default AssistanceTypeController