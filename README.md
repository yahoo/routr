# Routr

[![npm version](https://badge.fury.io/js/routr.svg)](http://badge.fury.io/js/routr)
![github actions](https://github.com/yahoo/routr/actions/workflows/node.js.yml/badge.svg)
[![Coverage Status](https://img.shields.io/coveralls/yahoo/routr.svg)](https://coveralls.io/r/yahoo/routr?branch=master)

Routr library is an implementation of router-related functionalities that can be used for both server and client. It follows the same routing rules as [Express](http://expressjs.com/) by using the same library. This library does not use callbacks for routes, instead just mapping them to string names that can be used as application state and used within your application later. For instance in Flux, the current route would be held as state in a store.

## Usage

For more detailed examples, please check out [example applications](https://github.com/yahoo/routr/tree/master/examples);

```javascript
import Router from 'routr';

const router = new Router([
    {
        name: 'view_user',
        path: '/user/:id',
        method: 'get',
        foo: {
            bar: 'baz',
        },
    },
    {
        name: 'view_user_post',
        path: '/user/:id/post/:post',
        method: 'get',
    },
]);

// match route
const route = router.getRoute('/user/garfield?foo=bar');
if (route) {
    // this will output:
    //   - "view_user" for route.name
    //   - "/user/garfield" for route.url
    //   - {id: "garfield"} for route.params
    //   - {path: "/user/:id", method: "get", foo: { bar: "baz"}} for route.config
    //   - { foo: 'bar' } for route.query
    console.log('[Route found]:', route);
}

// generate path name (does not include query string) from route
// "path" will be "/user/garfield/post/favoriteFood?meal=breakfast"
const path = router.makePath(
    'view_user_post',
    { id: 'garfield', post: 'favoriteFood' },
    { meal: 'breakfast' }
);
```

## Object.freeze

We use `Object.freeze` to freeze the router and route objects for non-production environments to ensure the immutability of these objects.

For production environments, it is recommended to use tools like [envify](https://github.com/hughsk/envify) along with [uglify](https://github.com/mishoo/UglifyJS) as part of your build process to strip out the production specific code for performance benefits.

We use `if (process.env.NODE_ENV !== 'production')` to wrap around `Object.freeze()`, so that you can use various tools to build the code for different environments:

### Build with Webpack

Two main utility plugins:

-   use [DefinePlugin](http://webpack.github.io/docs/list-of-plugins.html#defineplugin) to define the value for `process.env`
-   use [UglifyJsPlugin](http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) to remove dead code.

Example of the webpack configuration:

```js
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin(),
        ...
    ]
```

### Build with Browserify

Similar to webpack, you can also use the following two utils with your favorite build system:

-   use [envify](https://github.com/hughsk/envify) to set `process.env.NODE_ENV` to the desired environment
-   use [uglifyjs](https://github.com/mishoo/UglifyJS2) to remove dead code.

Command-line example:

```bash
$ browserify index.js -t [ envify --NODE_ENV production  ] | uglifyjs -c > bundle.js
```

## API

-   [Routr](https://github.com/yahoo/routr/blob/master/docs/routr.md)

## License

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[license file]: https://github.com/yahoo/routr/blob/master/LICENSE.md

Third-pary open source code used are listed in our [package.json file](https://github.com/yahoo/routr/blob/master/package.json).
