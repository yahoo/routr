# Routr API

## Constructor(routes)

Creates a new routr plugin instance with the following parameters:

 * `routes` (optional): Ordered list of routes used for matching.
 ** `route.name`: Name of the route (used for path making)
 ** `route.path`: The matching pattern of the route. Follows rules of [path-to-regexp](https://github
 .com/pillarjs/path-to-regexp)
 ** `route.method=GET`: The method that the path should match to.

## Instance Methods

### getRoute(url, options)

Returns the matched route info if path/method matches to a route; null otherwise.

 * `url` (required) The url to be used for route matching.  Query strings are **not** considered when performing the match.
 * `options` options object
 * `options.method` (optional) The case-insensitive HTTP method string. DEFAULT: 'get'

### makePath(name, params)

Generates a path string with the route with the given name, using the specified params.

 * `name` (required)  The route name
 * `options` (required) The route parameters to be used to create the path string
