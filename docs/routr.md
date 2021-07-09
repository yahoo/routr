# Routr API

## Constructor(routes, options)

Creates a new routr plugin instance with the following parameters:

-   `routes` (optional): Ordered list of routes used for matching.
    ** `route.name`: Name of the route (used for path making)
    ** `route.path`: The matching pattern of the route. Follows rules of [path-to-regexp](https://github
    .com/pillarjs/path-to-regexp)
    \*\* `route.method=undefined`: The method that the path should match to. Will match all methods if `undefined` and no
    methods
    if `null`.
-   `options` (optional): Options for parsing and generating the urls
    \*\* `options.queryLib=require('query-string')`: Library to use to `parse` and `stringify` query strings

## Instance Methods

### getRoute(url, options)

Returns the matched route info if path/method matches to a route; null otherwise.

-   `url` (required) The url to be used for route matching. Query strings are **not** considered when performing the match.
-   `options` options object
-   `options.method` (optional) The case-insensitive HTTP method string. DEFAULT: 'get'

### makePath(name, params, query)

Generates a path string with the route with the given name, using the specified params.

-   `name` (required) The route name
-   `params` (required) The route parameters to be used to create the path string
-   `query` (optional) The query parameters to be used to create the path string
