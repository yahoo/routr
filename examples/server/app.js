/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var express = require('express'),
    util = require('util'),
    Router = require('../../index'),
    app = express(),
    router;

router = new Router({
    view_user: {
        path: '/user/:id',
        method: 'get',
        foo: {
            bar: 'baz'
        }
    },
    view_user_post: {
        path: '/user/:id/post/:post',
        method: 'get'
    },
    edit_user: {
        path: '/user/:id',
        method: 'put'
    }
});

app.all('*', function (req, res) {
    var route = router.getRoute(req.url, {method: req.method});
    if (route) {
        res.send('[Route found] name=' + route.name + ' params = ' + util.inspect(route.params) + ' config = ' + util.inspect(route.config));
    } else {
        res.send(404, '[Route not found]');
    }
});

app.listen(3000, function () {
    console.log('Simple routr example listening on port 3000');
});