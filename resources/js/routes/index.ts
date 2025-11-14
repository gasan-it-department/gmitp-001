import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../wayfinder'
/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::login
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:23
 * @route '/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Auth\AuthenticateUserController::logout
 * @see app/External/Api/Controllers/Auth/AuthenticateUserController.php:58
 * @route '/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
export const home = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(args, options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/{municipality}/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
home.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return home.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
home.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
home.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
    const homeForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: home.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
        homeForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::home
 * @see app/External/Web/Controllers/Public/PublicController.php:16
 * @route '/{municipality}/home'
 */
        homeForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    home.form = homeForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
export const privacy = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(args, options),
    method: 'get',
})

privacy.definition = {
    methods: ["get","head"],
    url: '/{municipality}/privacy-policy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
privacy.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return privacy.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
privacy.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
privacy.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: privacy.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
    const privacyForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: privacy.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
        privacyForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: privacy.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::privacy
 * @see app/External/Web/Controllers/Public/PublicController.php:41
 * @route '/{municipality}/privacy-policy'
 */
        privacyForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: privacy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    privacy.form = privacyForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
export const government = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: government.url(args, options),
    method: 'get',
})

government.definition = {
    methods: ["get","head"],
    url: '/{municipality}/government',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
government.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return government.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
government.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: government.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
government.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: government.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
    const governmentForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: government.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
        governmentForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: government.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::government
 * @see app/External/Web/Controllers/Public/PublicController.php:36
 * @route '/{municipality}/government'
 */
        governmentForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: government.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    government.form = governmentForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
export const admin = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(args, options),
    method: 'get',
})

admin.definition = {
    methods: ["get","head"],
    url: '/{municipality}/municipal-admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
admin.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return admin.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
admin.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
admin.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: admin.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
    const adminForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: admin.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
        adminForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: admin.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::admin
 * @see app/External/Web/Controllers/Public/PublicController.php:46
 * @route '/{municipality}/municipal-admin'
 */
        adminForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: admin.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    admin.form = adminForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
export const requests = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requests.url(args, options),
    method: 'get',
})

requests.definition = {
    methods: ["get","head"],
    url: '/{municipality}/action-center/request-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
requests.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return requests.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
requests.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requests.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
requests.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: requests.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
    const requestsForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: requests.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
        requestsForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: requests.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::requests
 * @see app/External/Web/Controllers/Public/PublicController.php:56
 * @route '/{municipality}/action-center/request-list'
 */
        requestsForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: requests.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    requests.form = requestsForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
export const account = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: account.url(args, options),
    method: 'get',
})

account.definition = {
    methods: ["get","head"],
    url: '/{municipality}/my-account',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
account.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return account.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
account.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: account.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
account.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: account.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
    const accountForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: account.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
        accountForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: account.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::account
 * @see app/External/Web/Controllers/Public/PublicController.php:61
 * @route '/{municipality}/my-account'
 */
        accountForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: account.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    account.form = accountForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
export const contact = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contact.url(args, options),
    method: 'get',
})

contact.definition = {
    methods: ["get","head"],
    url: '/{municipality}/contact-us',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
contact.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return contact.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
contact.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contact.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
contact.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contact.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
    const contactForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: contact.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
        contactForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contact.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::contact
 * @see app/External/Web/Controllers/Public/PublicController.php:26
 * @route '/{municipality}/contact-us'
 */
        contactForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: contact.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    contact.form = contactForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
export const travel = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: travel.url(args, options),
    method: 'get',
})

travel.definition = {
    methods: ["get","head"],
    url: '/{municipality}/travel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
travel.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return travel.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
travel.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: travel.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
travel.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: travel.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
    const travelForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: travel.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
        travelForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: travel.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::travel
 * @see app/External/Web/Controllers/Public/PublicController.php:66
 * @route '/{municipality}/travel'
 */
        travelForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: travel.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    travel.form = travelForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
export const transparency = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transparency.url(args, options),
    method: 'get',
})

transparency.definition = {
    methods: ["get","head"],
    url: '/{municipality}/transparency',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
transparency.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return transparency.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
transparency.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transparency.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
transparency.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: transparency.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
    const transparencyForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: transparency.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
        transparencyForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: transparency.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::transparency
 * @see app/External/Web/Controllers/Public/PublicController.php:71
 * @route '/{municipality}/transparency'
 */
        transparencyForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: transparency.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    transparency.form = transparencyForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
export const orders = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(args, options),
    method: 'get',
})

orders.definition = {
    methods: ["get","head"],
    url: '/{municipality}/executive-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
orders.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return orders.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
orders.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
orders.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orders.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
    const ordersForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: orders.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
        ordersForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::orders
 * @see app/External/Web/Controllers/Public/PublicController.php:76
 * @route '/{municipality}/executive-orders'
 */
        ordersForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    orders.form = ordersForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
export const announcements = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: announcements.url(args, options),
    method: 'get',
})

announcements.definition = {
    methods: ["get","head"],
    url: '/{municipality}/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
announcements.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return announcements.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
announcements.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: announcements.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
announcements.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: announcements.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
    const announcementsForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: announcements.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
        announcementsForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: announcements.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::announcements
 * @see app/External/Web/Controllers/Public/PublicController.php:81
 * @route '/{municipality}/announcements'
 */
        announcementsForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: announcements.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    announcements.form = announcementsForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
export const wedding = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: wedding.url(args, options),
    method: 'get',
})

wedding.definition = {
    methods: ["get","head"],
    url: '/{municipality}/schedule-wedding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
wedding.url = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return wedding.definition.url
            .replace('{municipality}', parsedArgs.municipality.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
wedding.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: wedding.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
wedding.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: wedding.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
    const weddingForm = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: wedding.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
        weddingForm.get = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: wedding.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::wedding
 * @see app/External/Web/Controllers/Public/PublicController.php:86
 * @route '/{municipality}/schedule-wedding'
 */
        weddingForm.head = (args: { municipality: string | number } | [municipality: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: wedding.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    wedding.form = weddingForm
/**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
export const landing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})

landing.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
landing.url = (options?: RouteQueryOptions) => {
    return landing.definition.url + queryParams(options)
}

/**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
landing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})
/**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
landing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: landing.url(options),
    method: 'head',
})

    /**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
    const landingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: landing.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
        landingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: landing.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Web\Controllers\Public\PublicController::landing
 * @see app/External/Web/Controllers/Public/PublicController.php:11
 * @route '/'
 */
        landingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: landing.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    landing.form = landingForm
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
export const feedbackindex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feedbackindex.url(options),
    method: 'get',
})

feedbackindex.definition = {
    methods: ["get","head"],
    url: '/feedback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
feedbackindex.url = (options?: RouteQueryOptions) => {
    return feedbackindex.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
feedbackindex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feedbackindex.url(options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
feedbackindex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feedbackindex.url(options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
    const feedbackindexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feedbackindex.url(options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
        feedbackindexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feedbackindex.url(options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackindex
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:58
 * @route '/feedback'
 */
        feedbackindexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feedbackindex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feedbackindex.form = feedbackindexForm
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackstore
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
export const feedbackstore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: feedbackstore.url(options),
    method: 'post',
})

feedbackstore.definition = {
    methods: ["post"],
    url: '/feedback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackstore
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
feedbackstore.url = (options?: RouteQueryOptions) => {
    return feedbackstore.definition.url + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackstore
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
feedbackstore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: feedbackstore.url(options),
    method: 'post',
})

    /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackstore
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
    const feedbackstoreForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: feedbackstore.url(options),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackstore
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:18
 * @route '/feedback'
 */
        feedbackstoreForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: feedbackstore.url(options),
            method: 'post',
        })
    
    feedbackstore.form = feedbackstoreForm
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
export const feedbackshow = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feedbackshow.url(args, options),
    method: 'get',
})

feedbackshow.definition = {
    methods: ["get","head"],
    url: '/feedback/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
feedbackshow.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return feedbackshow.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
feedbackshow.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feedbackshow.url(args, options),
    method: 'get',
})
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
feedbackshow.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feedbackshow.url(args, options),
    method: 'head',
})

    /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
    const feedbackshowForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feedbackshow.url(args, options),
        method: 'get',
    })

            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
        feedbackshowForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feedbackshow.url(args, options),
            method: 'get',
        })
            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackshow
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:63
 * @route '/feedback/{id}'
 */
        feedbackshowForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feedbackshow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feedbackshow.form = feedbackshowForm
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackupdate
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
export const feedbackupdate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: feedbackupdate.url(args, options),
    method: 'put',
})

feedbackupdate.definition = {
    methods: ["put"],
    url: '/feedback/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackupdate
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
feedbackupdate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return feedbackupdate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackupdate
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
feedbackupdate.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: feedbackupdate.url(args, options),
    method: 'put',
})

    /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackupdate
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
    const feedbackupdateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: feedbackupdate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackupdate
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:68
 * @route '/feedback/{id}'
 */
        feedbackupdateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: feedbackupdate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    feedbackupdate.form = feedbackupdateForm
/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackdestroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
export const feedbackdestroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: feedbackdestroy.url(args, options),
    method: 'delete',
})

feedbackdestroy.definition = {
    methods: ["delete"],
    url: '/feedback/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackdestroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
feedbackdestroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return feedbackdestroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackdestroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
feedbackdestroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: feedbackdestroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackdestroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
    const feedbackdestroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: feedbackdestroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\External\Api\Controllers\Feedback\FeedbackController::feedbackdestroy
 * @see app/External/Api/Controllers/Feedback/FeedbackController.php:0
 * @route '/feedback/{id}'
 */
        feedbackdestroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: feedbackdestroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    feedbackdestroy.form = feedbackdestroyForm