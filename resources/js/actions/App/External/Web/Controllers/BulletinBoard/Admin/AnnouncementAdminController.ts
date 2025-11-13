import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/{municipality}/bulletin-board/announcement/admin'
 */
export const index = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{municipality}/bulletin-board/announcement/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/{municipality}/bulletin-board/announcement/admin'
 */
index.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/{municipality}/bulletin-board/announcement/admin'
 */
index.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/{municipality}/bulletin-board/announcement/admin'
 */
index.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})
const AnnouncementAdminController = { index }

export default AnnouncementAdminController