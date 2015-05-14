/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
/*global process:true */

var debug = require('debug')('Routr:router');
var pathToRegexp = require('path-to-regexp');
var METHODS = {
    GET: 'get'
};
var cachedCompilers = {};

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
    //TODO support array for method, ['get', 'post']
    return (method && method.toLowerCase()) === (this.config.method && this.config.method.toLowerCase());
};

/**
 * Checkes whether this route matches the given url, method (GET as default) and optional navigation related criteria.
 * @method match
 * @param {String} url   The relative url to be matched to this route.  Query strings and hash fragments
 *                       are **not** considered when performing the match.  E.g. /some_path?foo=bar#hashBaz
 *                       would match to the same route as /some_path
 * @param {Object} [options]
 * @param {String} [options.method=get] The case-insensitive HTTP method string.  Defaults to 'get'.
 * @param {Object} [options.navigate] The navigation info.
 * @param {Object} [options.navigate.type] The navigation type: 'pageload', 'click', 'popstate'.
 * @param {Object} [options.navigate.params] The navigation params (that are not part of the path).
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
    var method = options.method || METHODS.GET;
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

    // 3. check navParams, if this route has match requirements defined for navParams
    var navParamsConfig = (self.config.navigate && self.config.navigate.params);
    if (navParamsConfig) {
        var navParamConfigKeys = Object.keys(navParamsConfig);
        var navParams = (options.navigate && options.navigate.params) || {};
        var navParamMatched;

        for (i = 0, len = navParamConfigKeys.length; i < len; i++) {
            // for each navParam defined in the route config, make sure
            // the param passed in matches the defined pattern
            var configKey = navParamConfigKeys[i];
            var pattern = navParamsConfig[configKey];
            if (pattern instanceof RegExp) {
                navParamMatched = navParams[configKey] !== undefined && pattern.test(navParams[configKey]);
            } else {
                navParamMatched = (navParams[configKey] === pattern);
            }
            if (!navParamMatched) {
                // found a non-matching navParam -> this route does not match
                return null;
            }
        }
    }

    // 4. method/path/navParams all matched, extract the matched path params
    var routeParams = {};
    for (i = 0, len = self.keys.length; i < len; i++) {
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
    var routePath = this.config.path;
    var compiler;
    var err;

    if (Array.isArray(routePath)) {
        routePath = routePath[0];
    }

    if (typeof routePath === 'string') {
        compiler = cachedCompilers[routePath] || pathToRegexp.compile(routePath);
        cachedCompilers[routePath] = compiler;

        try {
            return compiler(params);
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
function Router(routes) {
    var self = this;
    self._routes = {};
    debug('new Router, routes = ', routes);
    if (routes) {
        Object.keys(routes).forEach(function createRoute(name) {
            self._routes[name] = new Route(name, routes[name]);
        });
    }
    if (process.env.NODE_ENV !== 'production') {
        if ('function' === typeof Object.freeze) {
            Object.keys(self._routes).forEach(function freezeRoute(name) {
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
 * @param {Object} [options.navigate] The navigation info.
 * @param {Object} [options.navigate.type] The navigation type: 'pageload', 'click', 'popstate'.
 * @param {Object} [options.navigate.params] The navigation params (that are not part of the path).
 * @return {Object|null} The matched route info if path/method/navigate.params matches to a route; null otherwise.
 */
Router.prototype.getRoute = function (url, options) {
    var keys = Object.keys(this._routes);
    var route;
    var match;

    for (var i = 0, len = keys.length; i < len; i++) {
        route = this._routes[keys[i]];
        match = route.match(url, options);
        if (match) {
            return {
                name: keys[i],
                url: url,
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
