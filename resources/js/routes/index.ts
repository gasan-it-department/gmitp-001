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