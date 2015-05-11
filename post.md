# Docker, AngularJS and Tutum — Part 1

This is part 1 of a 3 post series, where we will cover topics related to development, testing, Docker, continuous integration and continuous delivery.

In this tutorial you will learn how to:

- Set up a simple NodeJS and AngularJS app
- Create a Docker image, push it to DockerHub and run a container
- Running tests with Mocha
- Deploy to DigitalOcean and Continous Deployment with Tutum

The tools needed for development will be mentioned and explained through out the tutorial.

All the code of this tutorial is available on github <url>/tag

Let's get started.

### Set Up a NodeJS and AngularJS App

First you need to [download NodeJS](http://nodejs.org/download) (if not already installed).
For client dependencies we will be using Bower, to install it run the following command:

```sh
$ [sudp] npm install -g bower
```

Create a [package.json](link) and a [bower.json](link) file, they should look something like in the repo or grab them from there directly.

```sh
$ npm init
... follow instructions
$ bower init
... follow instructions
```

#### Client app
Create a directory structure for our `client` code and change default bower_components location to be inside this directory by creating a [.bowerrc](link) file

```sh
$ mkdir -p client/app
$ mkdir client/app/main
$ mkdir client/app/about
$ mkdir -p client/components/navbar
$ echo '{"directory": "client/bower_components"}' > .bowerrc
```

Now all depenencies will be installed in `client/bower_components`

```sh
$ bower install --save angular angular-ui-router bootstrap angular-bootstrap
```

We are going to use [angular-ui-router](http://angular-ui.github.io/ui-router/site/) instead of angular's which is much more flexible and powerful, for now in a basic level but in following posts we'll use more of what it provides.
Also notce that [bootstrap](http://getbootstrap.com/) css and [angular-ui-bootstrap](https://angular-ui.github.io/bootstrap/) will be used.

Now create the scaffold of our AngularJS app:

- [client/index.html](link)
- [client/app/app.js](link)
- [client/app/main/main.js](link)
- [client/app/main/main.html](link)
- [client/app/main/main-controller.js](link)
- [client/app/about/about.js](link)
- [client/app/about/about.html](link)
- [client/components/navbar/navbar.html](link)

Let's do a quick explanation on what is inside these files.

In `client/index.html` we define our base html for the app, we load all css/js dependencies as well as our own files.

```html
<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible", content="IE=edge,chrome=1">
      <meta name="viewport", content="width=device-width, initial-scale=1.0">
      <meta name="description", content="">
      <meta name="author", content="">

      <!-- enable html5mode routes -->
      <base href="/">

      <title>Docker, AngularJS, Tutum</title>

      <!-- deps -->
      <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css">
      <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap-theme.css">

      <!-- app -->
      <link rel="stylesheet" href="app/app.css">
    </head>

    <body ng-app="app">

      <!-- where ui-router load the views -->
      <div ui-view></div>

      <!-- deps -->
      <script src="bower_components/jquery/dist/jquery.js"></script>
      <script src="bower_components/angular/angular.js"></script>
      <script src="bower_components/angular-ui-router/release/angular-ui-router.js"></script>
      <script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
      <script src="bower_components/bootstrap/dist/js/bootstrap.js"></script>

      <!-- app -->
      <script src="app/app.js"></script>
      <script src="app/main/main.js"></script>
      <script src="app/main/main-controller.js"></script>
      <script src="app/about/about.js"></script>
    </body>
</html>
```

In `client/app/app.js` we define the basic angularjs bootstrap code, like configuration and some default values in the `$rootScope`.

```js
// create a angular module named 'app'
angular.module('app', [
    'ui.bootstrap', // load angular-ui.bootstrap
    'ui.router' // load angular-ui-router
  ])
  // router options
  .config(['$urlRouterProvider', '$locationProvider',
    function ($urlRouterProvider, $locationProvider) {
    'use strict';

    $locationProvider.html5Mode(true); // allow html5mode routes (no #)
    $urlRouterProvider.otherwise('/'); // if route not found redirect to /
  }])
  // after the configuration and when app runs the first time we o some more stuff
  .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    'use strict';
    // this is available from all across the app
    $rootScope.appName = 'app';

    // allow access from templates
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }]);
```

In `client/app/main/main.js` we define specific configuration for our "main" section like routes. Instead of creating all routes in the `app.js` we define them on each section to make it more maintainable.

```js
angular.module('app')
  .config(['$stateProvider', function ($stateProvider) {
    'use strict';

    $stateProvider.state('main', { // this is a name for our route
      url: '/', // the actual url path of the route
      templateUrl: 'app/main/main.html', // the template that will load
      controller: 'MainCtrl' // the name of the controller to use
    });
  }]);
```

In the template `client/app/main/main.html` we have a simple unordered list of items, and each item will be taken from some data source we will define in our controller. [Read more about ng-repeat](link)

```html
<div ng-include="'components/navbar/navbar.html'"></div>

<div class="container">
  <h1>Main</h1>
  <div class="row">
    <div class="col-sm-6">
      <div class="panel panel-default">
        <div class="panel-body">
          <ul>
            <li ng-repeat="item in list1">{{item.label}}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-sm-6">
      <div class="panel panel-default">
        <div class="panel-body">
          <ul>
            <li ng-repeat="item in list2">{{item.label}}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

In `client/app/main/main-controller.js` we define some data that will be accessible from the template.

```js
angular.module('app')
  .controller('MainCtrl', ['$scope', function ($scope) {
    // here we define the items to be repeated in the template
    $scope.list1 = [
      {label: 'one'},
      {label: 'two'},
      {label: 'three'}
    ];

    $scope.list2 = [
      {label: 'uno'},
      {label: 'dos'},
      {label: 'tres'}
    ];
  }]);

```

In `client/app/about/about.js` much of the same as the `main.js` but here we don't define a controller, just the template to load.

```js
angular.module('app')
  .config(['$stateProvider', function ($stateProvider) {
    'use strict';

    $stateProvider.state('about', {
      url: '/about',
      templateUrl: 'app/about/about.html'
    });
  }]);
```

and the `client/app/about/about.html` template:

```html
<div ng-include="'components/navbar/navbar.html'"></div>

<div class="container">
  <h1>About</h1>
  <p>About page</p>
</div>
```

And finally the `client/components/navbar/navbar.html`:

Notice that there is some boilerplate for making the navbar responsive using the [angular-ui-bootstrap](https://angular-ui.github.io/bootstrap/#/collapse) collapse directive.
And that we are using the `$state` that we defined in our `app.js` and the [$state.is()](https://github.com/angular-ui/ui-router/wiki/Quick-Reference#stateisstateorname--params) method to mark navigation item as active accordingly.

```html
<div class="navbar navbar-default navbar-static-top" ng-init="isCollapsed = true">
  <div class="container">
    <div class="navbar-header">
      <button class="navbar-toggle" type="button" ng-click="isCollapsed = !isCollapsed">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a href="/" class="navbar-brand">{{appName}}</a>
    </div>
    <div collapse="isCollapsed" class="navbar-collapse collapse">
      <ul class="nav navbar-nav navbar-right">
        <li ng-class="{active: $state.is('main')}"><a ui-sref="main">Main</a></li>
        <li ng-class="{active: $state.is('about')}"><a ui-sref="about">About</a></li>
      </ul>
    </div>
  </div>
</div>
```

#### Server

Now that the client files are ready to be served, we need to create our server to display them in the browser.

We are going to use [express.js](http://expressjs.com/) plus a couple of other modules to make our server, let's install all those.

```sh
$ npm install --save express compression morgan errorhandler
```

To read more about what the other modules do here are the links:

- [compression](https://www.npmjs.com/package/compression) (enable gzip/deflate compression)
- [morgan](https://www.npmjs.com/package/morgan) (log requests)
- [errorhandler](https://www.npmjs.com/package/errorhandler) (send error stack as response to the client if something failed)

Create the directory structure for our `server` code, from the root of the project

```sh
$ mkdir -p server/config
$ mkdir -p server/components/errors
$ mkdir server/views
```

Now we will create all files needed for the server to run:

- [server/app.js](link)
- [server/routes.js](link)
- [server/config/index.js](link)
- [server/config/express.js](link)
- [server/components/errors/index.js](link)
- [server/views/404.html](link)

Let's do a quick explanation on what is inside these files.

In `server/app.js` we define the code to run all our server:

```js
'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config');

// Setup server
var app = express();
var http = require('http');

// Express configuration
require('./config/express')(app);
// Route configutation
require('./routes')(app);

// Start server
http.createServer(app).listen(config.port, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
```

In `server/routes.js` we define some configuration for the routes, like 404 and other routes.

```js
/**
 * Main application routes
 */

'use strict';

var path = require('path');
var errors = require('./components/errors');

module.exports = function (app) {

  // All undefined asset routes should return a 404
  app.route('/:url(app|components|bower_components)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendFile(path.join(app.get('appPath'), 'index.html'));
    });
};
```

in `server/config/index.js` we define some common configuration for the server:

```js
/*
 * Config
 */

'use strict';

var path = require('path');

module.exports = {
  // Environment
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(path.join(__dirname, '../..')),

  // Server port
  port: 9000
};
```

And in `server/config/express.js` we setup express to serve our files.

```js
/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./index');

module.exports = function(app) {
  app.use(compression());
  app.use(express.static(path.join(config.root, 'client')));
  app.set('appPath', path.join(config.root, 'client')); // define the path of our app inside express to use across the server if needed
  app.use(morgan('dev'));
  app.use(errorHandler()); // error handler
};
```

In `server/components/errors/index.js` we define app errors like how 404 should behave and what to response.

```js
/**
 * Error responses
 */

'use strict';

var path = require('path');
var config = require('../../config');

module.exports[404] = function pageNotFound(req, res) {
  var viewFilePath = path.join(config.root, 'server/views/404.html');
  var statusCode = 404;
  var result = {
    status: statusCode
  };

  res.status(result.status);
  res.sendFile(viewFilePath, function (err) {
    // if the file doesn't exist of there is an error reading it just return a json with the error
    if (err) {
      return res.json(result, result.status);
    }
  });
};
```

And finally the `server/views/404.html` view

```html
<!doctype html>
  <html>
    <head>
      <title>404 Not Found</title>
    </head>

    <body>
      <h1>404</h1>
    </body>
</html>
```

Now we are ready to start the server:

```sh
$ node server/app.js
Express server listening on 9000, in development mode
```

Open your browser and yo should see your app in `http://localhost:9000`

## Docker

Check on their website on [how to install Docker](https://docs.docker.com/installation/mac/#command-line-docker-with-boot2docker) for Mac OS X

One way is using [Homebrew](http://brew.sh)

1) Install Homebrew
```sh
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
2) Install [Homebrew Cask](http://caskroom.io/) (for installing bin files through Homebrew)
```sh
$ brew install caskroom/cask/brew-cask
```
3) Install [VirtualBox](https://www.virtualbox.org/) (needed to run Docker in Mac OS X)
```sh
$ brew cask install virtualbox
```
4) Install [Docker](https://www.docker.com/)
```sh
$ brew install docker
```
5) Install [boot2docker](http://boot2docker.io/) (a virtual machine to run Docker)
```sh
$ brew install boot2docker
```
