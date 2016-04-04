/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
/*global process:true */

var debug = require('debug')('Routr:router');
var pathToRegexp = require('path-to-regexp');
var queryString = require('query-string');
var DEFAULT_METHOD = 'GET';
var cachedCompilers = {};

/**
 * @class Route
 * @param {String} name  The name of the route
 * @param {Object} config  The configuration for this route.
 * @param {String} config.path  The path of the route.
 * @param {Object} [options] Options for parsing and generating the urls
 * @param {String} [options.queryLib]  Library to use for `parse` and `stringify` methods
 * @constructor
 */
function Route(name, config, options) {
    options = options || {};
    this.name = name;
    this.config = config || {};
    var method = config.method;
    this.methods = method;

    if (method) {
        method = Array.isArray(method) ? method : [method];
        this.methods = {};
        for (var i=0; i<method.length; ++i) {
            this.methods[method[i].toUpperCase()] = true;
        }
    }
    this.keys = [];
    this.regexp = pathToRegexp(this.config.path, this.keys);
    this._queryLib = options.queryLib || queryString;
}

/**
 * Whether the given method is accepted by this route.
 * @method acceptMethod
 * @param {String} method  The HTTP VERB string.
 * @return {boolean} true if the method is accepted; false otherwise.
 * @for Route
 */
Route.prototype.acceptMethod = function (method) {
    if (!method || null === this.methods) {
        return false;
    }
    if (!this.methods) {
        // If no method is set on route, match all methods
        return true;
    }
    return this.methods[method];
};

/**
 * Checkes whether this route matches the given url, method (GET as default) and optional navigation related criteria.
 * @method match
 * @param {String} url   The relative url to be matched to this route.  Query strings and hash fragments
 *                       are **not** considered when performing the match.  E.g. /some_path?foo=bar#hashBaz
 *                       would match to the same route as /some_path
 * @param {Object} [options]
 * @param {String} [options.method=get] The case-insensitive HTTP method string.  Defaults to 'get'.
 * @return {Object|null} The matched route params if path/method/navParams matches to this route; null otherwise.
 * @for Route
 */
Route.prototype.match = function (url, options) {
    if (!url) {
        return null;
    }

    options = options || {};

    var self = this;
    var i;
    var len;

    // 1. check method
    var method = DEFAULT_METHOD;
    if (options.method) {
        method = options.method.toUpperCase();
    }
    if (!self.acceptMethod(method)) {
        return null;
    }

    // 2. check path
    // remove query string and hash fragment from url
    var pos = url.indexOf('?');
    var path;
    if (pos >= 0) {
        // remove query string
        path = url.substring(0, pos);
    } else {
        pos = url.indexOf('#');
        if (pos >= 0) {
            // hash fragment does not get sent to server.
            // But since routr can be used on both server and client,
            // we should remove hash fragment before matching the regex.
            path = url.substring(0, pos);
        } else {
            path = url;
        }
    }

    var pathMatches = self.regexp.exec(path);
    if (!pathMatches) {
        return null;
    }

    // 3. method/path/navParams all matched, extract the matched path params
    var routeParams = {};
    for (i = 0, len = self.keys.length; i < len; i++) {
        // Don't overwrite a previously populated parameter with `undefined`.
        // A route may legitimately have multiple instances of a parameter
        // name if the path was an array.
        if (pathMatches[i+1] !== undefined || routeParams[self.keys[i].name] === undefined){
            // Because pathToRegexp encodeURIComponent params values, it is necessary
            // to decode when reading from URL
            routeParams[self.keys[i].name] = decodeURIComponent(pathMatches[i+1]);
        }
    }

    // 4. query params
    var queryParams = {};
    if (-1 !== pos) {
        queryParams = self._queryLib.parse(url.substring(pos+1));
    }

    return {
        method: method,
        route: routeParams,
        query: queryParams
    };
};

/**
 * Generates a path string with this route, using the specified params.
 * @method makePath
 * @param {Object} params  The route parameters to be used to create the path string
 * @param {Object} [query] The query parameters to be used to create the path string
 * @return {String} The generated path string.
 * @for Route
 */
Route.prototype.makePath = function (params, query) {
    var routePath = this.config.path;
    var compiler;
    var err;
    var url;
    var strQuery;

    if (Array.isArray(routePath)) {
        routePath = routePath[0];
    }

    if (typeof routePath === 'string') {
        compiler = cachedCompilers[routePath] || pathToRegexp.compile(routePath);
        cachedCompilers[routePath] = compiler;

        try {
            url = compiler(params);
            if (query) {
                strQuery = this._queryLib.stringify(query);
                if (strQuery) {
                    url += '?' + strQuery;
                }
            }
            return url;
        } catch (e) {
            err = e;
        }
    } else {
        err = new TypeError('route path must be a string:' + routePath);
    }

    debug('Route.makePath failed, e = ', err);
    return null;
};

/**
 * A Router class that provides route matching and route generation functionalities.
 * @class Router
 * @param {Object} routes  Route table, which is a name to router config map.
 * @param {Object} [options] Options for parsing and generating the urls
 * @param {String} [options.queryLib]  Library to use for `parse` and `stringify` methods
 * @constructor
 * @example
    var Router = require('routr'),
        router,
        route;

    var router = new Router({
        view_user: {
            path: '/user/:id',
            method: 'get',
            foo: {
                bar: 'baz'
            }
        }
    });

    route = router.getRoute('/user/garfield');
    if (route) {
        // this will output:
        //   - "view_user" for route.name
        //   - "/user/garfield" for route.url
        //   - {id: "garfield"} for route.params
        //   - {path: "/user/:id", method: "get", foo: { bar: "baz"}} for route.config
        console.log('[Route found]: name=', route.name, 'url=', route.url, 'params=', route.params, 'config=', route.config);
    }
 */
function Router(routes, options) {
    var self = this;
    self._routes = {};
    self._routeOrder = [];
    self._options = options || {};
    debug('new Router, routes = ', routes);

    if (!Array.isArray(routes)) {
        // Support handling route config object as an ordered map (legacy)
        self._routeOrder = Object.keys(routes);
        self._routeOrder.forEach(function createRoute(name) {
            self._routes[name] = new Route(name, routes[name], self._options);
        });
    } else if (routes) {
        routes.forEach(function createRouteFromArrayValue(route) {
            if (!route.name) {
                throw new Error('Undefined route name for route ' + route.path);
            }
            // Route name already exists
            if (self._routes[route.name]) {
                throw new Error('Duplicate route with name ' + route.name);
            }
            self._routeOrder.push(route.name);
            self._routes[route.name] = new Route(route.name, route, self._options);
        });
    }

    if (process.env.NODE_ENV !== 'production') {
        if ('function' === typeof Object.freeze) {
            self._routeOrder.forEach(function freezeRoute(name) {
                var route = self._routes[name];
                Object.freeze(route.config);
                Object.freeze(route.keys);
                Object.freeze(route);
            });
            Object.freeze(self._routes);
        }
    }
}

/**
 * @method getRoute
 * @param {String} url   The url to be used for route matching.  Query strings are **not** considered
 *                        when performing the match.  E.g. /some_path?foo=bar would match to the same route
 *                        as /some_path
 * @param {Object} [options]
 * @param {String} [options.method=get] The case-insensitive HTTP method string.
 * @return {Object|null} The matched route info if path/method matches to a route; null otherwise.
 */
Router.prototype.getRoute = function (url, options) {
    var keys = this._routeOrder;
    var route;
    var match;

    for (var i = 0, len = keys.length; i < len; i++) {
        route = this._routes[keys[i]];
        match = route.match(url, options);
        if (match) {
            return {
                name: keys[i],
                url: url,
                method: match.method,
                params: match.route,
                config: route.config,
                query: match.query
            };
        }
    }
    return null;
};

/**
 * Generates a path string with the route with the given name, using the specified params.
 * @method makePath
 * @param {String} name  The route name
 * @param {Object} params  The route parameters to be used to create the path string
 * @param {Object} [query]  The query parameters to be used to create the path string
 * @return {String} The generated path string, null if there is no route with the given name.
 */
Router.prototype.makePath = function (name, params, query) {
    return (name && this._routes[name] && this._routes[name].makePath(params, query)) || null;
};

module.exports = Router;
