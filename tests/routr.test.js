/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Router = require('../lib/router');

var routesObject = {
    article: {
        path: '/:site/:category?/:subcategory?/:alias',
        method: 'get',
        page: 'viewArticle',
    },
    offnetwork_article: {
        path: '/',
        method: 'get',
        navigate: {
            params: {
                id: /^\w{4}-\w{3}$/,
                foo: 'bar',
            },
        },
        page: 'viewArticle',
    },
    home: {
        path: '/',
        method: 'get',
        page: 'viewHomepage',
    },
    new_article: {
        path: '/new_article',
        method: 'post',
        page: 'createArticle',
    },
    custom_match_params: {
        path: '/posts/:id(\\d+)',
    },
    unamed_params: {
        path: '/:foo/(.*)',
        method: null,
    },
    no_methods: {
        path: '/no_methods',
        method: null,
    },
    multi_methods: {
        path: '/multi_methods',
        method: ['get', 'post'],
    },
    all_methods: {
        path: '/all_methods',
    },
    case_insensitive: {
        path: '/case_insensitive',
        method: 'GET',
        page: 'viewCaseInsensitive',
    },
    array_path: {
        path: ['/array_path'],
    },
    array_path_name_collision: {
        path: [
            '/array/path/with/collision/foo/:key',
            '/array/path/with/collision/bar/:key',
        ],
        method: 'GET',
        page: 'arrayPathNameCollision',
    },
    array_path_with_different_props: {
        path: [
            '/array/path/with/different/props/foo/:foo',
            '/array/path/with/different/props/bar/:bar',
        ],
    },
    invalid_path: {
        path: 123,
    },
    json_value: {
        path: '/path/with/some/json_value/:json',
    },
};
var routesArray = Object.keys(routesObject).map(function (routeName) {
    return Object.assign({}, routesObject[routeName], {
        name: routeName,
    });
});
var encodingConsistencyPath =
    '/path/with/some/json_value/%7B%22keyword%22%3A%22foo%22%7D';
var arrayPathWithDifferentPropsFoo = '/array/path/with/different/props/foo/foo';
var arrayPathWithDifferentPropsBar = '/array/path/with/different/props/bar/bar';

describe('Router', function () {
    [routesObject, routesArray].forEach(function (routes, key) {
        var text = ['routes object', 'routes array'];
        describe(text[key], function () {
            var router;
            beforeEach(function () {
                router = new Router(routes);
            });

            describe('#constructor', function () {
                it('should init correctly', function () {
                    expect(Object.keys(router._routes).length).toEqual(
                        routesArray.length,
                    );

                    expect(router._routes.article.name).toEqual('article');
                    expect(router._routes.article.config.path).toEqual(
                        '/:site/:category?/:subcategory?/:alias',
                    );
                    expect(router._routes.article.config.method).toEqual('get');
                    expect(router._routes.article.config.page).toEqual(
                        'viewArticle',
                    );
                    expect(router._routes.article.config.navigate).toBe(
                        undefined,
                    );
                    expect(router._routes.article.keys.length).toEqual(4);
                    expect(router._routes.article.keys[0].name).toEqual('site');
                    expect(router._routes.article.keys[1].name).toEqual(
                        'category',
                    );
                    expect(router._routes.article.keys[2].name).toEqual(
                        'subcategory',
                    );
                    expect(router._routes.article.keys[3].name).toEqual(
                        'alias',
                    );
                    expect(router._routes.article.regexp).toBeInstanceOf(
                        RegExp,
                    );

                    expect(router._routes.offnetwork_article.name).toEqual(
                        'offnetwork_article',
                    );
                    expect(
                        router._routes.offnetwork_article.config.path,
                    ).toEqual('/');
                    expect(
                        router._routes.offnetwork_article.config.method,
                    ).toEqual('get');
                    expect(
                        router._routes.offnetwork_article.config.page,
                    ).toEqual('viewArticle');
                    expect(
                        router._routes.offnetwork_article.config.navigate
                            .params,
                    ).toBeInstanceOf(Object);
                    expect(
                        router._routes.offnetwork_article.config.navigate.params
                            .id,
                    ).toBeInstanceOf(RegExp);
                    expect(
                        router._routes.offnetwork_article.keys.length,
                    ).toEqual(0);
                    expect(
                        router._routes.offnetwork_article.regexp,
                    ).toBeInstanceOf(RegExp);

                    expect(router._routes.home.name).toEqual('home');
                    expect(router._routes.home.config.path).toEqual('/');
                    expect(router._routes.home.config.method).toEqual('get');
                    expect(router._routes.home.config.page).toEqual(
                        'viewHomepage',
                    );
                    expect(router._routes.home.keys.length).toEqual(0);
                    expect(router._routes.home.regexp).toBeInstanceOf(RegExp);

                    expect(router._routes.new_article.name).toEqual(
                        'new_article',
                    );
                    expect(router._routes.new_article.config.path).toEqual(
                        '/new_article',
                    );
                    expect(router._routes.new_article.config.method).toEqual(
                        'post',
                    );
                    expect(router._routes.new_article.config.page).toEqual(
                        'createArticle',
                    );
                    expect(router._routes.new_article.keys.length).toEqual(0);
                    expect(router._routes.new_article.regexp).toBeInstanceOf(
                        RegExp,
                    );

                    expect(router._routes.case_insensitive.name).toEqual(
                        'case_insensitive',
                    );
                    expect(router._routes.case_insensitive.config.path).toEqual(
                        '/case_insensitive',
                    );
                    expect(
                        router._routes.case_insensitive.config.method,
                    ).toEqual('GET');
                    expect(router._routes.case_insensitive.config.page).toEqual(
                        'viewCaseInsensitive',
                    );
                    expect(router._routes.case_insensitive.keys.length).toEqual(
                        0,
                    );
                    expect(
                        router._routes.case_insensitive.regexp,
                    ).toBeInstanceOf(RegExp);

                    expect(router._routes.array_path.name).toEqual(
                        'array_path',
                    );
                    expect(router._routes.array_path.config.path[0]).toEqual(
                        '/array_path',
                    );
                    expect(router._routes.array_path.keys.length).toEqual(0);
                    expect(router._routes.array_path.regexp).toBeInstanceOf(
                        RegExp,
                    );

                    expect(router._routes.invalid_path.name).toEqual(
                        'invalid_path',
                    );
                    expect(router._routes.invalid_path.config.path).toEqual(
                        123,
                    );
                    expect(router._routes.invalid_path.keys.length).toEqual(0);
                    expect(router._routes.invalid_path.regexp).toBeInstanceOf(
                        RegExp,
                    );
                });
                it('should not freeze in production env', function () {
                    var origEnv = process.env.NODE_ENV;
                    process.env.NODE_ENV = 'production';
                    var notFrozen = new Router(routes);

                    expect(Object.keys(notFrozen._routes).length).toEqual(
                        routesArray.length,
                    );
                    notFrozen._routes.foo = null;
                    expect(notFrozen._routes.foo).toBe(null);
                    expect(Object.keys(notFrozen._routes).length).toEqual(
                        routesArray.length + 1,
                    );

                    var homeRoute = notFrozen._routes.home;
                    expect(homeRoute.name).toEqual('home');
                    homeRoute.name = 'changed';
                    expect(homeRoute.name).toEqual('changed');
                    process.env.NODE_ENV = origEnv;
                });
                it('should freeze in non-production env', function () {
                    var origEnv = process.env.NODE_ENV;
                    process.env.NODE_ENV = 'development';
                    var frozen = new Router(routes);
                    var homeRoute = frozen._routes.home;
                    expect(Object.keys(frozen._routes).length).toEqual(
                        routesArray.length,
                    );
                    expect(homeRoute.name).toEqual('home');
                    expect(homeRoute.config.path).toEqual('/');
                    expect(homeRoute.config.method).toEqual('get');
                    expect(homeRoute.config.page).toEqual('viewHomepage');
                    expect(homeRoute.keys.length).toEqual(0);
                    expect(homeRoute.regexp).toBeInstanceOf(RegExp);
                    expect(function () {
                        frozen._routes.foo = 'abc';
                    }).toThrow(TypeError);
                    expect(function () {
                        homeRoute.name = 'unfreeze!';
                    }).toThrow(TypeError);
                    expect(function () {
                        homeRoute.config.method = 'unfreeze!';
                    }).toThrow(TypeError);
                    expect(function () {
                        homeRoute.config.page = 'unfreeze!';
                    }).toThrow(TypeError);
                    expect(function () {
                        homeRoute.keys[0] = 'unfreeze!';
                    }).toThrow(TypeError);
                    expect(function () {
                        homeRoute.config.regexp = null;
                    }).toThrow(TypeError);
                    expect(Object.keys(frozen._routes).length).toEqual(
                        routesArray.length,
                    );
                    expect(frozen._routes.foo).toBe(undefined);
                    expect(homeRoute.keys.length).toEqual(0);
                    expect(homeRoute.name).toEqual('home');
                    expect(homeRoute.config.path).toEqual('/');
                    expect(homeRoute.config.method).toEqual('get');
                    expect(homeRoute.config.page).toEqual('viewHomepage');
                    expect(homeRoute.keys.length).toEqual(0);
                    expect(homeRoute.regexp).toBeInstanceOf(RegExp);
                    process.env.NODE_ENV = origEnv;
                });
            });
        });
    });

    describe('#getRoute', function () {
        var router;
        beforeEach(function () {
            router = new Router(routesArray);
        });
        it('existing route', function () {
            var route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html',
                { method: 'get' },
            );
            expect(route.name).toEqual('article');
            expect(route.params.site).toEqual('finance');
            expect(route.params.category).toEqual('news');
            expect(route.params.alias).toEqual(
                'e-t-initially-horror-film-202700630.html',
            );

            route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html?query=true',
                {
                    method: 'get',
                },
            );
            expect(route.name).toEqual('article');
            expect(route.params.site).toEqual('finance');
            expect(route.params.category).toEqual('news');
            expect(route.params.alias).toEqual(
                'e-t-initially-horror-film-202700630.html',
            );

            route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html?query=true#hasHashToo',
                {
                    method: 'get',
                },
            );
            expect(route.name).toEqual('article');
            expect(route.params.site).toEqual('finance');
            expect(route.params.category).toEqual('news');
            expect(route.params.alias).toEqual(
                'e-t-initially-horror-film-202700630.html',
            );

            route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html#hasHash',
                {
                    method: 'get',
                },
            );
            expect(route.name).toEqual('article');
            expect(route.params.site).toEqual('finance');
            expect(route.params.category).toEqual('news');
            expect(route.params.alias).toEqual(
                'e-t-initially-horror-film-202700630.html',
            );

            route = router.getRoute(
                '/sports/blogs/nfl-shutdown-corner/report-says-aaron-hernandez-having-trouble-paying-legal-bills-215349137.html',
                { method: 'get' },
            );
            expect(route.name).toEqual('article');
            expect(route.params.site).toEqual('sports');
            expect(route.params.category).toEqual('blogs');
            expect(route.params.subcategory).toEqual('nfl-shutdown-corner');
            expect(route.params.alias).toEqual(
                'report-says-aaron-hernandez-having-trouble-paying-legal-bills-215349137.html',
            );

            route = router.getRoute('/new_article', { method: 'post' });
            expect(route.name).toEqual('new_article');

            route = router.getRoute('/new_article?foo=bar', { method: 'post' });
            expect(route.name).toEqual('new_article');
            expect(route.params).toEqual({});
            expect(route.query).toEqual({ foo: 'bar' });
        });

        it('can parse query params correctly', () => {
            const route = router.getRoute('/?foo=bar&a=b&a=c&bool');
            expect(route.query).toEqual({
                foo: 'bar',
                a: ['b', 'c'],
                bool: '',
            });
        });

        it('method should be case-insensitive and defaults to get', function () {
            var route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html',
            );
            expect(route.name).toEqual('article');
            expect(route.method).toEqual('GET');
            route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html',
                { method: 'GET' },
            );
            expect(route.name).toEqual('article');
            expect(route.method).toEqual('GET');
            route = router.getRoute('/new_article', { method: 'POST' });
            expect(route.method).toEqual('POST');
            expect(route.name).toEqual('new_article');
            route = router.getRoute('/case_insensitive', { method: 'get' });
            expect(route.name).toEqual('case_insensitive');
            expect(route.method).toEqual('GET');
        });

        it('non-existing route', function () {
            var route = router.getRoute(
                '/finance/news/e-t-initially-horror-film-202700630.html',
                { method: 'post' },
            );
            expect(route).toBe(null);

            route = router.getRoute('/finance');
            expect(route).toBe(null);

            route = router.getRoute('/new_article', 'delete');
            expect(route).toBe(null);
        });
        it('array route with param name collision first', function () {
            var route = router.getRoute('/array/path/with/collision/foo/abc');
            expect(route.params.key).toEqual('abc');
        });
        it('array route with param name collision second', function () {
            var route = router.getRoute('/array/path/with/collision/bar/abc');
            expect(route.params.key).toEqual('abc');
        });
        it('route with json string in param with consistency', function () {
            var route = router.getRoute(encodingConsistencyPath);
            expect(route.params.json).toEqual('{"keyword":"foo"}');
        });
        it('route with array path with different props', function () {
            var routeFoo = router.getRoute(arrayPathWithDifferentPropsFoo);
            expect(routeFoo.params.foo).toEqual('foo');
            var routeBar = router.getRoute(arrayPathWithDifferentPropsBar);
            expect(routeBar.params.bar).toEqual('bar');
        });
        it('should handle a hash fragment with a question-mark', function () {
            var route = router.getRoute('/finance/news/test.html#?', {
                method: 'get',
            });
            expect(route.name).toEqual('article');
            expect(route.params.site).toEqual('finance');
            expect(route.params.category).toEqual('news');
            expect(route.params.alias).toEqual('test.html');
        });

        it('should allow route to match multiple methods', function () {
            var route = 'multi_methods';
            expect(router.getRoute('/' + route).name).toEqual(route);
            expect(
                router.getRoute('/' + route, { method: 'post' }).name,
            ).toEqual(route);
            expect(router.getRoute('/' + route, { method: 'put' })).toBe(null);
            expect(router.getRoute('/' + route, { method: 'delete' })).toBe(
                null,
            );
        });

        it('should allow route to match all methods', function () {
            var route = 'all_methods';
            expect(router.getRoute('/' + route).name).toEqual(route);
            expect(
                router.getRoute('/' + route, { method: 'post' }).name,
            ).toEqual(route);
            expect(
                router.getRoute('/' + route, { method: 'put' }).name,
            ).toEqual(route);
            expect(
                router.getRoute('/' + route, { method: 'delete' }).name,
            ).toEqual(route);
        });

        it('should allow route to match no methods', function () {
            var route = 'no_methods';
            expect(router.getRoute('/' + route)).toBe(null);
            expect(router.getRoute('/' + route, { method: 'post' })).toBe(null);
            expect(router.getRoute('/' + route, { method: 'put' })).toBe(null);
            expect(router.getRoute('/' + route, { method: 'delete' })).toBe(
                null,
            );
        });
    });

    describe('#makePath', function () {
        var router;

        beforeEach(function () {
            router = new Router(routesArray);
        });

        it('existing route', function () {
            var path = router.makePath('article', {
                site: 'SITE',
                category: 'CATEGORY',
                subcategory: 'SUBCATEGORY',
                alias: 'ALIAS.html',
            });
            expect(path).toEqual('/SITE/CATEGORY/SUBCATEGORY/ALIAS.html');
        });

        it('handle optional params', function () {
            var path = router.makePath('article', {
                site: 'SITE',
                category: 'CATEGORY',
                alias: 'ALIAS.html',
            });
            expect(path).toEqual('/SITE/CATEGORY/ALIAS.html');
            path = router.makePath('article', {
                site: 'SITE',
                alias: 'ALIAS.html',
            });
            expect(path).toEqual('/SITE/ALIAS.html');
        });

        it('handle custom match params', function () {
            var path = router.makePath('custom_match_params', {
                id: '12345',
            });
            expect(path).toEqual('/posts/12345');
            path = router.makePath('custom_match_params', {
                id: '12345abc',
            });
            expect(path).toBe(null);
        });

        it('handle unamed params', function () {
            var path = router.makePath('unamed_params', {
                foo: 'foo',
                0: 'bar',
            });
            expect(path).toEqual('/foo/bar');
        });

        it('can build query params correctly', function () {
            var path = router.makePath(
                'home',
                {},
                {
                    c: '42',
                    a: 'bar',
                    b: ['1', '2', '3'],
                },
            );
            expect(path).toEqual('/?a=bar&b=1&b=2&b=3&c=42');
        });

        it('handle query params properly', function () {
            const originalPath = '/?a=bar&b=42&b=24&c=';
            const route = router.getRoute(originalPath);
            const path = router.makePath(route.name, route.params, route.query);

            expect(path).toEqual(originalPath);
        });

        it('adds no question mark with empty query', function () {
            var path = router.makePath(
                'unamed_params',
                {
                    foo: 'foo',
                    0: 'bar',
                },
                {
                    /* empty object */
                },
            );
            expect(path).toEqual('/foo/bar');
        });

        it('non-existing route', function () {
            var path = router.makePath('article_does_not_exist', {
                site: 'SITE',
                category: 'CATEGORY',
                subcategory: 'SUBCATEGORY',
                alias: 'ALIAS.html',
            });
            expect(path).toBe(null);
        });

        it('array route', function () {
            var path = router.makePath('array_path', {});
            expect(path).toEqual('/array_path');
        });

        it('invalid route', function () {
            var path = router.makePath('invalid_path', {});
            expect(path).toBe(null);
        });

        it('path with some json value and consistency', function () {
            var path = router.makePath('json_value', {
                json: JSON.stringify({ keyword: 'foo' }),
            });
            expect(path).toEqual(encodingConsistencyPath);
        });

        it('array path with different props', function () {
            var pathFoo = router.makePath('array_path_with_different_props', {
                foo: 'foo',
            });
            expect(pathFoo).toEqual(arrayPathWithDifferentPropsFoo);
            var pathBar = router.makePath('array_path_with_different_props', {
                bar: 'bar',
            });
            expect(pathBar).toEqual(arrayPathWithDifferentPropsBar);
            var pathInvalid = router.makePath(
                'array_path_with_different_props',
                {},
            );
            expect(pathInvalid).toBe(null);
        });
    });

    it('should throw if route name is not defined', function () {
        expect(function () {
            new Router([
                {
                    path: '/',
                },
            ]);
        }).toThrow(Error);
    });

    it('should throw if there are routes with duplicate name', function () {
        expect(function () {
            new Router([
                {
                    name: 'home',
                    path: '/',
                },
                {
                    name: 'home',
                    path: '/home',
                },
            ]);
        }).toThrow(Error);
    });

    it('should allow custom query string library', function () {
        var queryLib = {
            parse: jest.fn().mockImplementation(function (queryString) {
                return queryString.split('&').reduce(function (a, v) {
                    var split = v.split('=');
                    a[split[0]] = split[1] || null;
                    return a;
                }, {});
            }),
            stringify: jest.fn().mockImplementation(function (queryObject) {
                return Object.keys(queryObject)
                    .map(function (key) {
                        return key + '=' + queryObject[key];
                    })
                    .join('&');
            }),
        };
        var router = new Router(
            [
                {
                    name: 'home',
                    path: '/',
                    method: 'get',
                },
            ],
            {
                queryLib: queryLib,
            },
        );
        var matched = router.getRoute('/?foo=bar&bar=baz');
        expect(queryLib.parse).toHaveBeenCalled();
        expect(matched.query).toEqual({
            foo: 'bar',
            bar: 'baz',
        });
        var stringified = router.makePath(
            'home',
            {},
            {
                foo: 'bar',
                bar: 'baz',
            },
        );
        expect(queryLib.stringify).toHaveBeenCalled();
        expect(stringified).toEqual('/?foo=bar&bar=baz');
    });
});

describe('Route', function () {
    it('match', function () {
        var router = new Router(routesObject);
        var homeRoute = router._routes.home;
        expect(homeRoute.match()).toBe(null);
    });

    it('should leave unset optional parameters as undefined', function () {
        var router = new Router(routesObject);
        var article = router._routes.article;
        var result = article.match('/site/alias');
        expect(result.route.category).toBe(undefined);
        expect(result.route.subcategory).toBe(undefined);
    });
});
