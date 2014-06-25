var express = require('express'),
    util = require('util'),
    Router = require('../../index'),
    app = express(),
    router;

router = new Router({
    get_user: {
        path: '/user/:id',
        method: 'get',
        extraConfigs: {
            foo: 'bar'
        }
    }
});

app.get('*', function (req, res) {
    var route = router.getRoute(req.path);
    if (route) {
        res.send('[Route found] name=' + route.name + ' params = ' + util.inspect(route.params) + ' config = ' + util.inspect(route.config));
    } else {
        res.send(404, '[Route not found]');
    }
});

app.listen(3000, function () {
    console.log('Simple routr example listening on port 3000');
});