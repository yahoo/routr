/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach,process */
"use strict";

var expect = require('chai').expect;
var Router = require('../../../lib/router');
var routes = {
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
        path: '/:foo/(.*)'
    }
};
var router;

describe('Router', function () {
    beforeEach(function () {
        router = new Router(routes);
    });

    describe('#constructor', function () {
        it('should init correctly', function () {
            expect(Object.keys(router._routes).length).to.equal(6);

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
        });
        it('should not freeze in production env', function () {
            var origEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            var notFrozen = new Router(routes);

            expect(Object.keys(notFrozen._routes).length).to.equal(6);
            notFrozen._routes.foo = null;
            expect(notFrozen._routes.foo).to.equal(null);
            expect(Object.keys(notFrozen._routes).length).to.equal(7);

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
            expect(Object.keys(frozen._routes).length).to.equal(6);
            expect(homeRoute.name).to.equal('home');
            expect(homeRoute.config.path).to.equal('/');
            expect(homeRoute.config.method).to.equal('get');
            expect(homeRoute.config.page).to.equal('viewHomepage');
            expect(homeRoute.keys.length).to.equal(0);
            expect(homeRoute.regexp).to.be.a('RegExp');
            expect(function () {
                frozen._routes.foo = 'abc';
            }).to.throw(TypeError);
            expect(function () {
                homeRoute.name = 'unfreeze!';
            }).to.throw(TypeError);
            expect(function () {
                homeRoute.config.method = 'unfreeze!';
            }).to.throw(TypeError);
            expect(function () {
                homeRoute.config.page = 'unfreeze!';
            }).to.throw(TypeError);
            expect(function () {
                homeRoute.keys[0] = 'unfreeze!';
            }).to.throw(TypeError);
            expect(function () {
                homeRoute.config.regexp = null;
            }).to.throw(TypeError);
            expect(Object.keys(frozen._routes).length).to.equal(6);
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

    describe('#getRoute', function () {
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
        });

        it('method should be case-insensitive and defaults to get', function () {
            var route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html');
            expect(route.name).to.equal('article');
            route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html', {method: 'GET'});
            expect(route.name).to.equal('article');
            route = router.getRoute('/new_article', {method: 'POST'});
            expect(route.name).to.equal('new_article');
        });

        it('check navigate.params if defined', function () {
            var route = router.getRoute('/', {navigate: {params: {id: 'abcd-efg', foo: 'bar'}}});
            expect(route.name).to.equal('offnetwork_article', 'navigate: {params.id matches regexp, foo === bar');
            expect(route.navigate).to.eql({params: {id: 'abcd-efg', foo: 'bar'}}, 'navigate: {params.id does not match, foo === bar');
            route = router.getRoute('/', {navigate: {params: {id: 'abcd-efg', foo: 'baz'}}});
            expect(route.name).to.equal('home', 'navigate: {params.id matches regexp, foo !== bar');
            expect(route.navigate).to.eql({params: {id: 'abcd-efg', foo: 'baz'}}, 'navigate: {params.id does not match, foo === bar');
            route = router.getRoute('/', {navigate: {params: {id: 'abcd-efg'}}});
            expect(route.name).to.equal('home', 'navigate: {params.id matches regexp, foo is missing');
            expect(route.navigate).to.eql({params: {id: 'abcd-efg'}}, 'navigate: {params.id does not match, foo === bar');
            route = router.getRoute('/', {navigate: {params: {id: 'abcd-ef', foo: 'bar'}}});
            expect(route.name).to.equal('home', 'navigate: {params.id does not match, foo === bar');
            expect(route.navigate).to.eql({params: {id: 'abcd-ef', foo: 'bar'}}, 'navigate: {params.id does not match, foo === bar');
            route = router.getRoute('/', {navigate: {params: {id: undefined}}});
            expect(route.name).to.equal('home', 'navigate.params.id is undefined');
            route = router.getRoute('/');
            expect(route.name).to.equal('home');
        });

        it('non-existing route', function () {
            var route = router.getRoute('/finance/news/e-t-initially-horror-film-202700630.html', {method: 'post'});
            expect(route).to.equal(null);

            route = router.getRoute('/finance');
            expect(route).to.equal(null);

            route = router.getRoute('/new_article', 'delete');
            expect(route).to.equal(null);
        });
    });

    describe('#makePath', function () {
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
        it('non-existing route', function () {
            var path = router.makePath('article_does_not_exist', {
                site: 'SITE',
                category: 'CATEGORY',
                subcategory: 'SUBCATEGORY',
                alias: 'ALIAS.html'
            });
            expect(path).to.equal(null);
        });
    });
});

describe('Route', function () {
    it('match', function () {
        router = new Router(routes);
        var homeRoute = router._routes.home;
        expect(homeRoute.match()).to.equal(null, 'empty path returns null');
    });
});

