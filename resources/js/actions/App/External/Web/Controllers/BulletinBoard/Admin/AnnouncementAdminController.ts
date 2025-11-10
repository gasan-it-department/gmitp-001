import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/bulletin-board/announcement/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\BulletinBoard\Admin\AnnouncementAdminController::index
 * @see app/External/Web/Controllers/BulletinBoard/Admin/AnnouncementAdminController.php:10
 * @route '/bulletin-board/announcement/admin'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
const AnnouncementAdminController = { index }

export default AnnouncementAdminController