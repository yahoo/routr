/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach,process */
'use strict';

var expect = require('chai').expect;
var Router = require('../../../lib/router');
var sinon = require('sinon');
var routesObject = {
    article: {
        path: '/:site/:category?/:subcategory?/:alias',
        method: 'get',
        page: 'viewArticle'
    },
    offnetwork_article: {
        path: '/',
        method: 'get',
        navigate: {
            params: {
                id: /^\w{4}\-\w{3}$/,
                foo: 'bar'
            }
        },
        page: 'viewArticle'
    },
    home: {
        path: '/',
        method: 'get',
        page: 'viewHomepage'
    },
    new_article: {
        path: '/new_article',
        method: 'post',
        page: 'createArticle'
    },
    custom_match_params: {
        path: '/posts/:id(\\d+)'
    },
    unamed_params: {
        path: '/:foo/(.*)',
        method: null
    },
    no_methods: {
        path: '/no_methods',
        method: null
    },
    multi_methods: {
        path: '/multi_methods',
        method: ['get', 'post']
    },
    all_methods: {
        path: '/all_methods'
    },
    case_insensitive: {
        path: '/case_insensitive',
        method: 'GET',
        page: 'viewCaseInsensitive'
    },
    array_path: {
        path: ['/array_path']
    },
    array_path_name_collision: {
        path: [
            '/array/path/with/collision/foo/:key',
            '/array/path/with/collision/bar/:key'
        ],
        method: 'GET',
        page: 'arrayPathNameCollision'
    },
    invalid_path: {
        path: 123
    },
    json_value: {
        path: '/path/with/some/json_value/:json'
    }
};
var routesArray = Object.keys(routesObject).map(function (routeName) {
    return Object.assign({}, routesObject[routeName], {
        name: routeName
    });
});
var encodingConsistencyPath = '/path/with/some/json_value/%7B%22keyword%22%3A%22foo%22%7D';

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
                    expect(Object.keys(router._routes).length).to.equal(routesArray.length);

                    expect(router._routes.article.name).to.equal('article');
                    expect(router._routes.article.config.path).to.equal('/:site/:category?/:subcategory?/:alias');
                    expect(router._routes.article.config.method).to.equal('get');
                    expect(router._routes.article.config.page).to.equal('viewArticle');
                    expect(router._routes.article.config.navigate).to.equal(undefined);
                    expect(router._routes.article.keys.length).to.equal(4);
                    expect(router._routes.article.keys[0].name).to.equal('site');
                    expect(router._routes.article.keys[1].name).to.equal('category');
                    expect(router._routes.article.keys[2].name).to.equal('subcategory');
                    expect(router._routes.article.keys[3].name).to.equal('alias');
                    expect(router._routes.article.regexp).to.be.a('RegExp');

                    expect(router._routes.offnetwork_article.name).to.equal('offnetwork_article');
                    expect(router._routes.offnetwork_article.config.path).to.equal('/');
                    expect(router._routes.offnetwork_article.config.method).to.equal('get');
                    expect(router._routes.offnetwork_article.config.page).to.equal('viewArticle');
                    expect(router._routes.offnetwork_article.config.navigate.params).to.be.a('object');
                    expect(router._routes.offnetwork_article.config.navigate.params.id).to.be.a('RegExp');
                    expect(router._routes.offnetwork_article.keys.length).to.equal(0);
                    expect(router._routes.offnetwork_article.regexp).to.be.a('RegExp');

                    expect(router._routes.home.name).to.equal('home');
                    expect(router._routes.home.config.path).to.equal('/');
                    expect(router._routes.home.config.method).to.equal('get');
                    expect(router._routes.home.config.page).to.equal('viewHomepage');
                    expect(router._routes.home.keys.length).to.equal(0);
                    expect(router._routes.home.regexp).to.be.a('RegExp');

                    expect(router._routes.new_article.name).to.equal('new_article');
                    expect(router._routes.new_article.config.path).to.equal('/new_article');
                    expect(router._routes.new_article.config.method).to.equal('post');
                    expect(router._routes.new_article.config.page).to.equal('createArticle');
                    expect(router._routes.new_article.keys.length).to.equal(0);
                    expect(router._routes.new_article.regexp).to.be.a('RegExp');

                    expect(router._routes.case_insensitive.name).to.equal('case_insensitive');
                    expect(router._routes.case_insensitive.config.path).to.equal('/case_insensitive');
                    expect(router._routes.case_insensitive.config.method).to.equal('GET');
                    expect(router._routes.case_insensitive.config.page).to.equal('viewCaseInsensitive');
                    expect(router._routes.case_insensitive.keys.length).to.equal(0);
                    expect(router._routes.case_insensitive.regexp).to.be.a('RegExp');

                    expect(router._routes.array_path.name).to.equal('array_path');
                    expect(router._routes.array_path.config.path[0]).to.equal('/array_path');
                    expect(router._routes.array_path.keys.length).to.equal(0);
                    expect(router._routes.array_path.regexp).to.be.a('RegExp');

                    expect(router._routes.invalid_path.name).to.equal('invalid_path');
                    expect(router._routes.invalid_path.config.path).to.equal(123);
                    expect(router._routes.invalid_path.keys.length).to.equal(0);
                    expect(router._routes.invalid_path.regexp).to.be.a('RegExp');
                });
                it('should not freeze in production env', function () {
                    var origEnv = process.env.NODE_ENV;
                    process.env.NODE_ENV = 'production';
                    var notFrozen = new Router(routes);

                    expect(Object.keys(notFrozen._routes).length).to.equal(routesArray.length);
                    notFrozen._routes.foo = null;
                    expect(notFrozen._routes.foo).to.equal(null);
                    expect(Object.keys(notFrozen._routes).length).to.equal(routesArray.length + 1);

                    var homeRoute = notFrozen._routes.home;
                    expect(homeRoute.name).to.equal('home');
                    homeRoute.name = 'changed';
                    expect(homeRoute.name).to.equal('changed');
                    process.env.NODE_ENV = origEnv;
                });
                it('should freeze in non-production env', function () {
                    var origEnv = process.env.NODE_ENV;
                    process.env.NODE_ENV = 'development';
                    var frozen = new Router(routes);
                    var homeRoute = frozen._routes.home;
                    expect(Object.keys(frozen._routes).length).to.equal(routesArray.length);
                    expect(homeRoute.name).to.equal('home');
                    expect(homeRoute.config.path).to.equal('/');
                    expect(homeRoute.config.method).to.equal('get');
                    expect(homeRoute.config.page).to.equal('viewHomepage');
                    expect(homeRoute.keys.length).to.equal(0);
                    expect(homeRoute.regexp).to.be.a('RegExp');
                    expect(function () {
                        frozen._routes.foo = 'abc';
                    }).to['throw'](TypeError);
                    expect(function () {
                        homeRoute.name = 'unfreeze!';
                    }).to['throw'](TypeError);
                    expect(function () {
                        homeRoute.config.method = 'unfreeze!';
                    }).to['throw'](TypeError);
                    expect(function () {
                        homeRoute.config.page = 'unfreeze!';
                    }).to['throw'](TypeError);
                    expect(function () {
                        homeRoute.keys[0] = 'unfreeze!';
                    }).to['throw'](TypeError);
                    expect(function () {
                        homeRoute.config.regexp = null;
                    }).to['throw'](TypeError);
                    expect(Object.keys(frozen._routes).length).to.equal(routesArray.length);
                    expect(frozen._routes.foo).to.equal(undefined);
                    expect(homeRoute.keys.length).to.equal(0);
                    expect(homeRoute.name).to.equal('home');
                    expect(homeRoute.config.path).to.equal('/');
                    expect(homeRoute.config.method).to.equal('get');
                    expect(homeRoute.config.page).to.equal('viewHomepage');
                    expect(homeRoute.keys.length).to.equal(0);
                    expect(homeRoute.regexp).to.be.a('RegExp');
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
            var route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html', {method: 'get'});
            expect(route.name).to.equal('article');
            expect(route.params.site).to.equal('finance');
            expect(route.params.category).to.equal('news');
            expect(route.params.alias).to.equal('e-t-initially-horror-film-202700630.html');

            route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html?query=true', {method: 'get'});
            expect(route.name).to.equal('article');
            expect(route.params.site).to.equal('finance');
            expect(route.params.category).to.equal('news');
            expect(route.params.alias).to.equal('e-t-initially-horror-film-202700630.html');

            route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html?query=true#hasHashToo', {method: 'get'});
            expect(route.name).to.equal('article');
            expect(route.params.site).to.equal('finance');
            expect(route.params.category).to.equal('news');
            expect(route.params.alias).to.equal('e-t-initially-horror-film-202700630.html');

            route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html#hasHash', {method: 'get'});
            expect(route.name).to.equal('article');
            expect(route.params.site).to.equal('finance');
            expect(route.params.category).to.equal('news');
            expect(route.params.alias).to.equal('e-t-initially-horror-film-202700630.html');

            route = router.getRoute('/sports/blogs/nfl-shutdown-corner/report-says-aaron-hernandez-having-trouble-paying-legal-bills-215349137.html', {method: 'get'});
            expect(route.name).to.equal('article');
            expect(route.params.site).to.equal('sports');
            expect(route.params.category).to.equal('blogs');
            expect(route.params.subcategory).to.equal('nfl-shutdown-corner');
            expect(route.params.alias).to.equal('report-says-aaron-hernandez-having-trouble-paying-legal-bills-215349137.html');

            route = router.getRoute('/new_article', {method: 'post'});
            expect(route.name).to.equal('new_article');

            route = router.getRoute('/new_article?foo=bar', {method: 'post'});
            expect(route.name).to.equal('new_article');
            expect(route.params).to.deep.equal({});
            expect(route.query).to.deep.equal({foo: 'bar'});
        });

        it('method should be case-insensitive and defaults to get', function () {
            var route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html');
            expect(route.name).to.equal('article');
            expect(route.method).to.equal('GET');
            route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html', {method: 'GET'});
            expect(route.name).to.equal('article');
            expect(route.method).to.equal('GET');
            route = router.getRoute('/new_article', {method: 'POST'});
            expect(route.method).to.equal('POST');
            expect(route.name).to.equal('new_article');
            route = router.getRoute('/case_insensitive', {method: 'get'});
            expect(route.name).to.equal('case_insensitive');
            expect(route.method).to.equal('GET');
        });

        it('non-existing route', function () {
            var route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html', {method: 'post'});
            expect(route).to.equal(null);

            route = router.getRoute('/finance');
            expect(route).to.equal(null);

            route = router.getRoute('/new_article', 'delete');
            expect(route).to.equal(null);
        });
        it('array route with param name collision first', function () {
            var route = router.getRoute('/array/path/with/collision/foo/abc');
            expect(route.params.key).to.equal('abc');
        });
        it('array route with param name collision second', function () {
            var route = router.getRoute('/array/path/with/collision/bar/abc');
            expect(route.params.key).to.equal('abc');
        });
        it('route with json string in param with consistency', function () {
            var route = router.getRoute(encodingConsistencyPath);
            expect(route.params.json).to.equal('{"keyword":"foo"}');
        });

        it('should allow route to match multiple methods', function () {
            var route = 'multi_methods';
            expect(router.getRoute('/' + route).name).to.equal(route);
            expect(router.getRoute('/' + route, {method: 'post'}).name).to.equal(route);
            expect(router.getRoute('/' + route, {method: 'put'})).to.equal(null);
            expect(router.getRoute('/' + route, {method: 'delete'})).to.equal(null);
        });

        it('should allow route to match all methods', function () {
            var route = 'all_methods';
            expect(router.getRoute('/' + route).name).to.equal(route);
            expect(router.getRoute('/' + route, {method: 'post'}).name).to.equal(route);
            expect(router.getRoute('/' + route, {method: 'put'}).name).to.equal(route);
            expect(router.getRoute('/' + route, {method: 'delete'}).name).to.equal(route);
        });

        it('should allow route to match no methods', function () {
            var route = 'no_methods';
            expect(router.getRoute('/' + route)).to.equal(null);
            expect(router.getRoute('/' + route, {method: 'post'})).to.equal(null);
            expect(router.getRoute('/' + route, {method: 'put'})).to.equal(null);
            expect(router.getRoute('/' + route, {method: 'delete'})).to.equal(null);
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
                alias: 'ALIAS.html'
            });
            expect(path).to.equal('/SITE/CATEGORY/SUBCATEGORY/ALIAS.html');
        });
        it('handle optional params', function () {
            var path = router.makePath('article', {
                site: 'SITE',
                category: 'CATEGORY',
                alias: 'ALIAS.html'
            });
            expect(path).to.equal('/SITE/CATEGORY/ALIAS.html');
            path = router.makePath('article', {
                site: 'SITE',
                alias: 'ALIAS.html'
            });
            expect(path).to.equal('/SITE/ALIAS.html');
        });
        it('handle custom match params', function () {
            var path = router.makePath('custom_match_params', {
                id: '12345'
            });
            expect(path).to.equal('/posts/12345');
            path = router.makePath('custom_match_params', {
                id: '12345abc'
            });
            expect(path).to.equal(null);
        });
        it('handle unamed params', function () {
            var path = router.makePath('unamed_params', {
                foo: 'foo',
                0: 'bar'
            });
            expect(path).to.equal('/foo/bar');
        });
        it('handle query params', function () {
            var path = router.makePath('unamed_params', {
                foo: 'foo',
                0: 'bar'
            }, {
                foo: 'bar',
                baz: 'foo'
            });
            expect(path).to.equal('/foo/bar?baz=foo&foo=bar');
        });
        it('non-existing route', function () {
            var path = router.makePath('article_does_not_exist', {
                site: 'SITE',
                category: 'CATEGORY',
                subcategory: 'SUBCATEGORY',
                alias: 'ALIAS.html'
            });
            expect(path).to.equal(null);
        });
        it('array route', function () {
            var path = router.makePath('array_path', {});
            expect(path).to.equal('/array_path');
        });
        it('invalid route', function () {
            var path = router.makePath('invalid_path', {});
            expect(path).to.equal(null);
        });
        it('path with some json value and consistency', function () {
            var path = router.makePath('json_value', {
                json: JSON.stringify({keyword: 'foo'})
            });
            expect(path).to.equal(encodingConsistencyPath);
        });
    });

    it('should throw if route name is not defined', function () {
        expect(function () {
            new Router([
                {
                    path: '/'
                }
            ]);
        }).to['throw'](Error);
    });

    it('should throw if there are routes with duplicate name', function () {
        expect(function () {
            new Router([
                {
                    name: 'home',
                    path: '/'
                },
                {
                    name: 'home',
                    path: '/home'
                }
            ]);
        }).to['throw'](Error);
    });

    it('should allow custom query string library', function () {
        var queryLib = {
            parse: sinon.spy(function (queryString) {
                return queryString.split('&').reduce(function (a, v) {
                    var split = v.split('=');
                    a[split[0]] = split[1] || null;
                    return a;
                }, {});
            }),
            stringify: sinon.spy(function (queryObject) {
                return Object.keys(queryObject).map(function (key) {
                    return key + '=' + queryObject[key];
                }).join('&');
            })
        };
        var router = new Router([
            {
                name: 'home',
                path: '/',
                method: 'get'
            }
        ], {
            queryLib: queryLib
        });
        var matched = router.getRoute('/?foo=bar&bar=baz');
        expect(queryLib.parse.called).to.equal(true);
        expect(matched.query).to.deep.equal({
            foo: 'bar',
            bar: 'baz'
        });
        var stringified = router.makePath('home', {}, {
            foo: 'bar',
            bar: 'baz'
        });
        expect(queryLib.stringify.called).to.equal(true);
        expect(stringified).to.equal('/?foo=bar&bar=baz');
    });
});

describe('Route', function () {
    it('match', function () {
        var router = new Router(routesObject);
        var homeRoute = router._routes.home;
        expect(homeRoute.match()).to.equal(null, 'empty path returns null');
    });
});

