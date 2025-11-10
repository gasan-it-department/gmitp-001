import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\External\Web\Controllers\Public\PublicController::showMainLandingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
export const showMainLandingPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMainLandingPage.url(options),
    method: 'get',
})

showMainLandingPage.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMainLandingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
showMainLandingPage.url = (options?: RouteQueryOptions) => {
    return showMainLandingPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMainLandingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
showMainLandingPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMainLandingPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showMainLandingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
showMainLandingPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMainLandingPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showServicePage
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
export const showServicePage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showServicePage.url(options),
    method: 'get',
})

showServicePage.definition = {
    methods: ["get","head"],
    url: '/services',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showServicePage
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
showServicePage.url = (options?: RouteQueryOptions) => {
    return showServicePage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showServicePage
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
showServicePage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showServicePage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showServicePage
 * @see app/External/Web/Controllers/Public/PublicController.php:21
 * @route '/services'
 */
showServicePage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showServicePage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showNewsEventsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
export const showNewsEventsPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showNewsEventsPage.url(options),
    method: 'get',
})

showNewsEventsPage.definition = {
    methods: ["get","head"],
    url: '/news-events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showNewsEventsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
showNewsEventsPage.url = (options?: RouteQueryOptions) => {
    return showNewsEventsPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showNewsEventsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
showNewsEventsPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showNewsEventsPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showNewsEventsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:31
 * @route '/news-events'
 */
showNewsEventsPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showNewsEventsPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/government'
 */
export const showGovernmentPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showGovernmentPage.url(options),
    method: 'get',
})

showGovernmentPage.definition = {
    methods: ["get","head"],
    url: '/government',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/government'
 */
showGovernmentPage.url = (options?: RouteQueryOptions) => {
    return showGovernmentPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/government'
 */
showGovernmentPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showGovernmentPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/government'
 */
showGovernmentPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showGovernmentPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/home'
 */
export const showHomePage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showHomePage.url(options),
    method: 'get',
})

showHomePage.definition = {
    methods: ["get","head"],
    url: '/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/home'
 */
showHomePage.url = (options?: RouteQueryOptions) => {
    return showHomePage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/home'
 */
showHomePage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showHomePage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/home'
 */
showHomePage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showHomePage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/privacy-policy'
 */
export const showPrivacyPolicyPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showPrivacyPolicyPage.url(options),
    method: 'get',
})

showPrivacyPolicyPage.definition = {
    methods: ["get","head"],
    url: '/privacy-policy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/privacy-policy'
 */
showPrivacyPolicyPage.url = (options?: RouteQueryOptions) => {
    return showPrivacyPolicyPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/privacy-policy'
 */
showPrivacyPolicyPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showPrivacyPolicyPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/privacy-policy'
 */
showPrivacyPolicyPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showPrivacyPolicyPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/municipal-admin'
 */
export const showMunicipalAdminPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMunicipalAdminPage.url(options),
    method: 'get',
})

showMunicipalAdminPage.definition = {
    methods: ["get","head"],
    url: '/municipal-admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/municipal-admin'
 */
showMunicipalAdminPage.url = (options?: RouteQueryOptions) => {
    return showMunicipalAdminPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/municipal-admin'
 */
showMunicipalAdminPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMunicipalAdminPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/municipal-admin'
 */
showMunicipalAdminPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMunicipalAdminPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
export const showActionCenterPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterPage.url(options),
    method: 'get',
})

showActionCenterPage.definition = {
    methods: ["get","head"],
    url: '/action-center',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
showActionCenterPage.url = (options?: RouteQueryOptions) => {
    return showActionCenterPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
showActionCenterPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/action-center'
 */
showActionCenterPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showActionCenterPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
export const showActionCenterRequestPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterRequestPage.url(options),
    method: 'get',
})

showActionCenterRequestPage.definition = {
    methods: ["get","head"],
    url: '/action-center/request-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
showActionCenterRequestPage.url = (options?: RouteQueryOptions) => {
    return showActionCenterRequestPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
showActionCenterRequestPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterRequestPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/action-center/request-list'
 */
showActionCenterRequestPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showActionCenterRequestPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
export const showMyAccountPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMyAccountPage.url(options),
    method: 'get',
})

showMyAccountPage.definition = {
    methods: ["get","head"],
    url: '/my-account',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
showMyAccountPage.url = (options?: RouteQueryOptions) => {
    return showMyAccountPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
showMyAccountPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMyAccountPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/my-account'
 */
showMyAccountPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMyAccountPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/contact-us'
 */
export const showContactUsPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showContactUsPage.url(options),
    method: 'get',
})

showContactUsPage.definition = {
    methods: ["get","head"],
    url: '/contact-us',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/contact-us'
 */
showContactUsPage.url = (options?: RouteQueryOptions) => {
    return showContactUsPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/contact-us'
 */
showContactUsPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showContactUsPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/contact-us'
 */
showContactUsPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showContactUsPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/travel'
 */
export const showTravelPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTravelPage.url(options),
    method: 'get',
})

showTravelPage.definition = {
    methods: ["get","head"],
    url: '/travel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/travel'
 */
showTravelPage.url = (options?: RouteQueryOptions) => {
    return showTravelPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/travel'
 */
showTravelPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTravelPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/travel'
 */
showTravelPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showTravelPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/transparency'
 */
export const showTransparencyPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTransparencyPage.url(options),
    method: 'get',
})

showTransparencyPage.definition = {
    methods: ["get","head"],
    url: '/transparency',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/transparency'
 */
showTransparencyPage.url = (options?: RouteQueryOptions) => {
    return showTransparencyPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/transparency'
 */
showTransparencyPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTransparencyPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/transparency'
 */
showTransparencyPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showTransparencyPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/executive-orders'
 */
export const showExecutiveOrdersPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showExecutiveOrdersPage.url(options),
    method: 'get',
})

showExecutiveOrdersPage.definition = {
    methods: ["get","head"],
    url: '/executive-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/executive-orders'
 */
showExecutiveOrdersPage.url = (options?: RouteQueryOptions) => {
    return showExecutiveOrdersPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/executive-orders'
 */
showExecutiveOrdersPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showExecutiveOrdersPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/executive-orders'
 */
showExecutiveOrdersPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showExecutiveOrdersPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/announcements'
 */
export const showAnnouncementsPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAnnouncementsPage.url(options),
    method: 'get',
})

showAnnouncementsPage.definition = {
    methods: ["get","head"],
    url: '/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/announcements'
 */
showAnnouncementsPage.url = (options?: RouteQueryOptions) => {
    return showAnnouncementsPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/announcements'
 */
showAnnouncementsPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAnnouncementsPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/announcements'
 */
showAnnouncementsPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showAnnouncementsPage.url(options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/schedule-wedding'
 */
export const showWeddingPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showWeddingPage.url(options),
    method: 'get',
})

showWeddingPage.definition = {
    methods: ["get","head"],
    url: '/schedule-wedding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/schedule-wedding'
 */
showWeddingPage.url = (options?: RouteQueryOptions) => {
    return showWeddingPage.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/schedule-wedding'
 */
showWeddingPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showWeddingPage.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/schedule-wedding'
 */
showWeddingPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showWeddingPage.url(options),
    method: 'head',
})
const PublicController = { showMainLandingPage, showServicePage, showNewsEventsPage, showGovernmentPage, showHomePage, showPrivacyPolicyPage, showMunicipalAdminPage, showActionCenterPage, showActionCenterRequestPage, showMyAccountPage, showContactUsPage, showTravelPage, showTransparencyPage, showExecutiveOrdersPage, showAnnouncementsPage, showWeddingPage }

export default PublicController