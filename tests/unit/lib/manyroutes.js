/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach,afterEach */
"use strict";

var expect = require('chai').expect,
    Router = require('../../../lib/router'),
    routes = populateRoutes(),
    router,
    start;

function populateRoutes() {
  var numberOfRoutes = 100000;
  var routes = {};

  for (var i = 0; i < numberOfRoutes; i++) {
      routes[i] = {
          path: '/' + i,
          method: 'get',
          page: i
      };
  }

  return routes;
}

describe('ManyRoutes', function () {

    beforeEach(function () {
        router = new Router(routes);
        start = process.hrtime();
    });

    afterEach(function () {
       var end = process.hrtime(start);
       console.log('benchmark took %d ms', (end[0] * 1000) + (end[1] / 1000000));
    });
    
    describe('#getRoute', function () {
        it('existing route', function () {
            var route = router.getRoute('/9999', {method: 'get'});
            expect(route.name).to.equal('9999');
        });
    });
});
