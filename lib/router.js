/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Routr:router'),
    pathToRegexp = require('path-to-regexp'),
    reverend = require('reverend'),
    METHODS = {
        GET: 'get'
    };

/**
 * @class Route
 * @param {String} name  The name of the route
 * @param {Object} config  The configuration for this route.
 * @param {String} config.path  The path of the route.
 * @constructor
 */
function Route(name, config) {
    this.name = name;
    this.config = config || {};
    this.keys = [];
    this.regexp = pathToRegexp(this.config.path, this.keys);
}

/**
 * Whether the given method is accepted by this route.
 * @method acceptMethod
 * @param {String} method  The HTTP VERB string.
 * @return true if the method is accepted; false otherwise.
 * @for Route
 */
Route.prototype.acceptMethod = function (method) {
    return method === this.config.method;
};

/**
 * Checkes whether this route matches the given path, method (GET as default) and optionally navigation related criteria.
 * @method match
 * @param {String} path   The url path to be matched to this route
 * @param {Object} [options]
 * @param {String} [options.method=get] The case-insensitive HTTP method string.  Defaults to 'get'.
 * @param {Object} [options.navigate] The navigation info.
 * @param {Object} [options.navigate.type] The navigation type: 'pageload', 'click', 'popstate'.
 * @param {Object} [options.navigate.params] The navigation params (that are not part of the path).
 * @return {Object|null} The matched route params if path/method/navParams matches to this route; null otherwise.
 * @for Route
 */
Route.prototype.match = function (path, options) {
    if (!path) {
        return null;
    }

    var self = this,
        method,
        navParams,
        navParamsConfig,
        navParamConfigKeys,
        navParamMatched,
        pathMatches,
        routeParams,
        key,
        pattern;

    options = options || {};

    // 1. check method
    method = (options.method && options.method.toLowerCase()) || METHODS.GET;
    if (!self.acceptMethod(method)) {
        return null;
    }

    // 2. check path
    pathMatches = self.regexp.exec(path);
    if (!pathMatches) {
        return null;
    }

    // 3. check navParams, if this route has match requirements defined for navParams
    navParamsConfig = (self.config.navigate && self.config.navigate.params);
    if (navParamsConfig) {
        navParamConfigKeys = Object.keys(navParamsConfig);
        navParams = (options.navigate && options.navigate.params) || {};
        for (i = 0, len = navParamConfigKeys.length; i < len; i++) {
            // for each navParam defined in the route config, make sure
            // the param passed in matches the defined pattern
            key = navParamConfigKeys[i];
            pattern = navParamsConfig[key];
            if (pattern instanceof RegExp) {
                navParamMatched = navParams[key] !== undefined && pattern.test(navParams[key]);
            } else {
                navParamMatched = (navParams[key] === pattern);
            }
            if (!navParamMatched) {
                // found a non-matching navParam -> this route does not match
                return null;
            }
        }
    }

    // 4. method/path/navParams all matched, extract the matched path params
    routeParams = {};
    for (var i = 0, len = self.keys.length; i < len; i++) {
        routeParams[self.keys[i].name] = pathMatches[i+1];
    }

    return routeParams;
};

/**
 * Generates a path string with this route, using the specified params.
 * @method makePath
 * @param {Object} params  The route parameters to be used to create the path string
 * @return {String} The generated path string.
 * @for Route
 */
Route.prototype.makePath = function (params) {
    try {
        return reverend(this.config.path, params);
    } catch (e) {
        debug('Route.makePath failed, e = ', e);
        return null;
    }
};

/**
 * A Router class that provides route matching and route generation functionalities.
 * @class Router
 * @param {Object} routes  Route table, which is a name to router config map.
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
        //   - {id: "garfield"} for route.params
        //   - {path: "/user/:id", method: "get", foo: { bar: "baz"}} for route.config
        console.log('[Route found]: name=', route.name, 'params=', route.params, 'config=', route.config);
    }
 */
function Router(routes) {
    var self = this;
    self._routes = {};
    debug('new Router, routes = ', routes);
    if (routes) {
        Object.keys(routes).forEach(function createRoute(name) {
            self._routes[name] = new Route(name, routes[name]);
        });
    }
}

/**
 * @method getRoute
 * @param {String} path   The url path.
 * @param {Object} [options]
 * @param {String} [options.method=get] The case-insensitive HTTP method string.
 * @param {Object} [options.navigate] The navigation info.
 * @param {Object} [options.navigate.type] The navigation type: 'pageload', 'click', 'popstate'.
 * @param {Object} [options.navigate.params] The navigation params (that are not part of the path).
 * @return {Object|null} The matched route info if path/method/navigate.params matches to a route; null otherwise.
 */
Router.prototype.getRoute = function (path, options) {
    var self = this,
        keys = Object.keys(self._routes),
        i,
        len = keys.length,
        route,
        match;

    for (i = 0; i < len; i++) {
        route = self._routes[keys[i]];
        match = route.match(path, options);
        if (match) {
            return {
                name: keys[i],
                path: path,
                params: match,
                config: route.config,
                navigate: options && options.navigate
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
 * @return {String} The generated path string, null if there is no route with the given name.
 */
Router.prototype.makePath = function (name, params) {
    return (name && this._routes[name] && this._routes[name].makePath(params)) || null;
};

module.exports = Router;
