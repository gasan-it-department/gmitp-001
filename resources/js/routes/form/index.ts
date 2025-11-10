import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:7
 * @route '/feedback-form-testing'
 */
export const sample = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sample.url(options),
    method: 'get',
})

sample.definition = {
    methods: ["get","head"],
    url: '/feedback-form-testing',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:7
 * @route '/feedback-form-testing'
 */
sample.url = (options?: RouteQueryOptions) => {
    return sample.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:7
 * @route '/feedback-form-testing'
 */
sample.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sample.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:7
 * @route '/feedback-form-testing'
 */
sample.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sample.url(options),
    method: 'head',
})
const form = {
    sample: Object.assign(sample, sample),
}

export default form