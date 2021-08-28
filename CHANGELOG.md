# Change Log

## 3.0.1

-   [#114] fix handling of array like query params

## 3.0.0

### Breaking Changes

-   [#110] `routr` uses native `URLSearchParams` instead of `query-string` to parse query strings. As a consequence, parsing `?foo` will result in `{ foo: '' }` as specified in the [WHATWG spec](https://url.spec.whatwg.org/#interface-urlsearchparams) instead of `{ foo: null }` as `query-string` would do. Also, `URLSearchParams` is not available in older browsers (noticeably IE11). If you need to support them, you can either add a `URLSearchParams` polyfill or inject `query-string` when instantiating `routr`:

```js
router = new Routr(routes, {
    queryLib: require('query-string'),
});
```

-   [#113] Updated `path-to-regexp` to its latest version

## 2.1.0

-   [#37] Enhance makePath for routes with path array

## 2.0.2

-   [#36] Bug fix: Add support for question marks in hash fragments

## 2.0.1

-   [#35] Fix decodeURIComponent of undefined bug

## 2.0.0

### Breaking Changes

-   [#33] `getRoute` will now `decodeURIComponent` route values, you might need to remove `decodeURIComponent` from your route actions if you were supporting extended characters manually in your routes.

## 1.0.0

### Breaking Changes

-   [#29] `navigate` is no longer used as part of `router.getRoute` options
-   [#29] `route.navigate` has been removed from the matched route object

### Features

-   [#30] Route definitions should now be defined as an array of route objects
    rather than a map of routes. The old method of defining routes
    with a map is still supported, but ordering can not be guaranteed
    (as per the JavaScript engine's implementation).
-   [#31] Added support for parsing and constructing urls with query strings.
    Matched route objects now contain a `query` property containing the map of
    query parameters. `router.makePath` now accepts a third `query` parameter
    which is a map of query parameters to add to the resulting URL string. e.g.
    `router.makePath('home', {}, { foo: 'bar' });` will result in `/?foo=bar`.
    Query strings are generated using the `query-string` npm module, but can
    be customized by adding the `options.queryLib` to the `Router` constructor.
    The replacement should have a `parse` and `stringify` method similar to
    `query-string`. An example replacement would be `qs`.
-   [#32] Allow routes to match multiple HTTP methods by using an array
    for the `route.method` attribute. By default, routes with an undefined
    `method` will match ANY method.

## 0.1.3

### Features

-   [#27] Support for array paths with parameter name collision

## 0.1.2

### Internal

-   Replace `reverand` with `path-to-regexp` for creation of paths

## 0.1.1

### Features

-   [#22] Make route methods case-insensitive

## 0.1.0

### Breaking Change

-   Renamed "path" field to "url" in the return object of getRoute()

## 0.0.6

### Internal

-   Update devDependencies and Readme

## 0.0.5

### Features

-   Freeze route objects in non-production environments

## 0.0.4

### Features

-   Allow matching paths containing query strings

## 0.0.3

### Features

-   Updated dependencies

## 0.0.2

### Features

-   [#2] Introduction of `navigate` property under route

## 0.0.1

First version.
