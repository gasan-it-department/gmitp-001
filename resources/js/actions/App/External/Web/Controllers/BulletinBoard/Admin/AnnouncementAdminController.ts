import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../../wayfinder'
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
const AnnouncementAdminController = { index }

export default AnnouncementAdminController