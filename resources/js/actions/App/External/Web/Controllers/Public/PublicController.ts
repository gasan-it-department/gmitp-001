<<<<<<< HEAD
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
=======
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
>>>>>>> 674e707 (fixed the announcement division for municipality)
/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
export const showHomePage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showHomePage.url(args, options),
    method: 'get',
})

showHomePage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
showHomePage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showHomePage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
showHomePage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showHomePage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showHomePage
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
showHomePage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showHomePage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
export const showPrivacyPolicyPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showPrivacyPolicyPage.url(args, options),
    method: 'get',
})

showPrivacyPolicyPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/privacy-policy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
showPrivacyPolicyPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showPrivacyPolicyPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
showPrivacyPolicyPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showPrivacyPolicyPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showPrivacyPolicyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
showPrivacyPolicyPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showPrivacyPolicyPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
export const showGovernmentPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showGovernmentPage.url(args, options),
    method: 'get',
})

showGovernmentPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/government',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
showGovernmentPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showGovernmentPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
showGovernmentPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showGovernmentPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showGovernmentPage
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
showGovernmentPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showGovernmentPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
export const showMunicipalAdminPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMunicipalAdminPage.url(args, options),
    method: 'get',
})

showMunicipalAdminPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/municipal-admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
showMunicipalAdminPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showMunicipalAdminPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
showMunicipalAdminPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMunicipalAdminPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showMunicipalAdminPage
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
showMunicipalAdminPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMunicipalAdminPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
export const showActionCenterPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterPage.url(args, options),
    method: 'get',
})

showActionCenterPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/action-center',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
showActionCenterPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showActionCenterPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
showActionCenterPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterPage
 * @see app/External/Web/Controllers/Public/PublicController.php:51
 * @route '/{municipality}/action-center'
 */
showActionCenterPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showActionCenterPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
export const showActionCenterRequestPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterRequestPage.url(args, options),
    method: 'get',
})

showActionCenterRequestPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/action-center/request-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
showActionCenterRequestPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showActionCenterRequestPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
showActionCenterRequestPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActionCenterRequestPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showActionCenterRequestPage
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
showActionCenterRequestPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showActionCenterRequestPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
export const showMyAccountPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMyAccountPage.url(args, options),
    method: 'get',
})

showMyAccountPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/my-account',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
showMyAccountPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showMyAccountPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
showMyAccountPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMyAccountPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showMyAccountPage
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
showMyAccountPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMyAccountPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
export const showContactUsPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showContactUsPage.url(args, options),
    method: 'get',
})

showContactUsPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/contact-us',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
showContactUsPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showContactUsPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
showContactUsPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showContactUsPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showContactUsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
showContactUsPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showContactUsPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
export const showTravelPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTravelPage.url(args, options),
    method: 'get',
})

showTravelPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/travel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
showTravelPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showTravelPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
showTravelPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTravelPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showTravelPage
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
showTravelPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showTravelPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
export const showTransparencyPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTransparencyPage.url(args, options),
    method: 'get',
})

showTransparencyPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/transparency',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
showTransparencyPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showTransparencyPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
showTransparencyPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showTransparencyPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showTransparencyPage
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
showTransparencyPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showTransparencyPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
export const showExecutiveOrdersPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showExecutiveOrdersPage.url(args, options),
    method: 'get',
})

showExecutiveOrdersPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/executive-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
showExecutiveOrdersPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showExecutiveOrdersPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
showExecutiveOrdersPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showExecutiveOrdersPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showExecutiveOrdersPage
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
showExecutiveOrdersPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showExecutiveOrdersPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
export const showAnnouncementsPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAnnouncementsPage.url(args, options),
    method: 'get',
})

showAnnouncementsPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
showAnnouncementsPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showAnnouncementsPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
showAnnouncementsPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAnnouncementsPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showAnnouncementsPage
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
showAnnouncementsPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showAnnouncementsPage.url(args, options),
    method: 'head',
})

/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
export const showWeddingPage = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showWeddingPage.url(args, options),
    method: 'get',
})

showWeddingPage.definition = {
    methods: ["get","head"],
    url: '/{municipality}/schedule-wedding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
showWeddingPage.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showWeddingPage.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
showWeddingPage.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showWeddingPage.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::showWeddingPage
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
showWeddingPage.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showWeddingPage.url(args, options),
    method: 'head',
})

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
const PublicController = { showHomePage, showPrivacyPolicyPage, showGovernmentPage, showMunicipalAdminPage, showActionCenterPage, showActionCenterRequestPage, showMyAccountPage, showContactUsPage, showTravelPage, showTransparencyPage, showExecutiveOrdersPage, showAnnouncementsPage, showWeddingPage, showMainLandingPage }

export default PublicController