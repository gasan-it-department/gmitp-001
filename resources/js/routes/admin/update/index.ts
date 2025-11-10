import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
export const status = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/action-center/admin/request/{assistanceId}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
status.url = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assistanceId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    assistanceId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assistanceId: args.assistanceId,
                }

    return status.definition.url
            .replace('{assistanceId}', parsedArgs.assistanceId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
status.post = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
    const statusForm = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\ActionCenter\ActionCenterStatusController::status
 * @see app/External/Api/Controllers/ActionCenter/ActionCenterStatusController.php:26
 * @route '/action-center/admin/request/{assistanceId}/status'
 */
        statusForm.post = (args: { assistanceId: string | number } | [assistanceId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, options),
            method: 'post',
        })
    
    status.form = statusForm
const update = {
    status: Object.assign(status, status),
}

export default update