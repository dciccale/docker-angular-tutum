# Docker, AngularJS and Tutum — Part 1

![](https://tutumcloud.files.wordpress.com/2015/06/tutorial-angular1.png)

Level: Beginner

This is part 1 of a 3 post series, where we will cover topics related to development, testing, Docker, continuous integration and continuous delivery.

In this tutorial you will learn how to:

- Set up a simple NodeJS and AngularJS app
- Create a Docker image, push it to DockerHub and run a container
- Unit test with Karma and Mocha
- Deploy to DigitalOcean and Continous Deployment with [Tutum](https://www.tutum.co/)

The tools needed for development will be mentioned and explained through out the tutorial.

All the code of this tutorial is available on github url/tag

After watching this tweet I will try to make this tutorial as much as easy to follow as possible

https://twitter.com/ossia/status/588389121053200385

Let's get started.

### Set Up a NodeJS and AngularJS App

First you need to [download NodeJS](http://nodejs.org/download) (if not already installed).
For client dependencies we will be using Bower, to install it run the following command in your terminal.

```sh
$ [sudp] npm install -g bower
```

Ceate a directory for your app

```sh
$ mkdir my_app
```

Create a [package.json](link) and a [bower.json](link) file, they should look something like in the repo or grab them from there directly. (if you do that skip the next step and just run `bower install` and `npm install`)

```sh
$ npm init
... follow instructions
$ bower init
... follow instructions
```

### Client app
Create a directory structure for our `client` code and change default bower_components location to be inside this directory by creating a [.bowerrc](link) file

```sh
$ mkdir -p client/app
$ mkdir client/app/main
$ mkdir client/app/about
$ mkdir -p client/components/navbar
$ echo '{"directory": "client/bower_components"}' > .bowerrc
```

The last command indicates bower that all depenencies will be installed in `client/bower_components`

Install deps

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
  .run(['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';
    // this is available from all across the app
    $rootScope.appName = 'app';

    // make $state available from templates
    $rootScope.$state = $state;
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

Notice that there is some boilerplate for making the navbar responsive using the [angular-ui-bootstrap collapse directive](https://angular-ui.github.io/bootstrap/#/collapse).
And that we are using the `$state` object in the template that we defined in our `app.js` and the [$state.is()](https://github.com/angular-ui/ui-router/wiki/Quick-Reference#stateisstateorname--params) method to mark navigation item as active accordingly.
With `ng-init` we define the `isCollapsed` variable to false into the scope. [Read more about ng-init](https://docs.angularjs.org/api/ng/directive/ngInit)

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

### Server

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

Open your browser and yo should see the app in `http://localhost:9000`

## Tests

Let's write some tests with [Mocha](http://mochajs.org) and [Chai](http://chaijs.com/)

For running the tests we will be using [Karma](https://karma-runner.github.io) test runner.

```sh
$ npm install --save-dev karma karma-mocha karma-chai karma-phantomjs-launcher karma-ng-html2js-preprocessor
```

Now we need to create a `karma.conf.js` file, grab it from the [repo](link) and put it in the root directory of the project.

And since we are writing tests for Angular, we will need  [angular-mocks](https://github.com/angular/bower-angular-mocks), let's install it and create the tests directory structure:

```sh
$ bower install angular-mocks
$ mkdir -p test/client/app
$ mkdir test/client/app/main
$ mkdir test/client/app/about
```

Create the following files:

- [test/client/app/app.test.js](link)
- [test/client/app/main/main.test.js](link)
- [test/client/app/main/main-controller.test.js](link)
- [test/client/app/about/about.test.js](link)

See how we mimic the directory structure but files ending in `.test.js` to easyly know where the unit test are located for each file.

In `test/client/app/app.test.js` we add some test to check the angular module is being created.

```js
describe('app', function () {
  'use strict';
  // load our angular moule befor each test
  beforeEach(module('app'));

  describe('app tests', function () {
    it('should recognize our angular module', function () {
      expect(angular.module('app')).to.exist;
    });
  });
});
```

In `test/client/app/main/main.test.js`

#### Run tests

Add/modify the `test`command in the `package.json` file to be:

```json
"scripts": {
  "test": "node ./node_modules/karma/bin/karma start --single-run"
}
```

Now you will be able to run the tests with

```sh
$ npm test
```

## Docker

### Installation

Check their website on [how to install Docker for Mac OS X](https://docs.docker.com/installation/mac/#command-line-docker-with-boot2docker)

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

### Start Docker

To start Docker run:

```sh
$ boot2docker up
```

You should see a similar output:

```sh
Waiting for VM and Docker daemon to start...
..........ooo
Started.
Writing /Users/<user>/.boot2docker/certs/boot2docker-vm/ca.pem
Writing /Users/<user>/.boot2docker/certs/boot2docker-vm/cert.pem
Writing /Users/<user>/.boot2docker/certs/boot2docker-vm/key.pem

To connect the Docker client to the Docker daemon, please set:
    export DOCKER_TLS_VERIFY=1
    export DOCKER_HOST=tcp://192.168.59.103:2376
    export DOCKER_CERT_PATH=/Users/<user>/.boot2docker/certs/boot2docker-vm
```

So follow the instructions to connect the Docker client, use the values provided in your terminal, (i.e. `<user>` should be your user)

```sh
$ export DOCKER_TLS_VERIFY=1
$ export DOCKER_HOST=tcp://192.168.59.103:2376
$ export DOCKER_CERT_PATH=/Users/<user>/.boot2docker/certs/boot2docker-vm
```

Now you should be able to run something like `docker version` to check docker is running.

### So, what is Docker?

Watch an introduction video to Docker in the official site https://www.docker.com/whatisdocker/

Basicly let's you create an isolated container with all the files, including dependencies, binaries, for your app to run, making it easier to ship and deploy.

### Dockerfile

To tell Docker what to include in the [container](https://docs.docker.com/terms/container/) we first need to create an [image](https://docs.docker.com/terms/image/) from a [Dockerfile](https://docs.docker.com/reference/builder/) definition.

Let's create out `Dockerfile` in the root directory of our project.

```
# This image will be based on the oficial nodejs docker image
# This image will be based on the oficial nodejs docker image
FROM node:latest

# Set in what directory commands will run
WORKDIR /home/app

# Put all our code inside that directory that lives in the container
ADD . /home/app

# Install dependencies
RUN \
    npm install -g bower && \
    npm install && \
    bower install --config.interactive=false --allow-root

# Tell Docker we are going to use this port
EXPOSE 9000

# The command to run our app when the container is run
CMD ["node", "server/app.js"]
```

#### Create Docker image
So, as you can se everything is commented in the Dockerfile to understand what steps are taken for creating the Docker image.

To finally create the image we need to run

```sh
$ docker build -t app .
```

To see the newly created image run `docker images` you should see something like:

```sh
REPOSITORY          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
app                 latest              4ad898544bec        4 minutes ago       751.6 MB
```

#### Run a Docker container

To run a container using the image we just created run:

```sh
$ docker run -d --name my_app -p 80:9000 app
```

This will run a container in the background (dettached) `-d` with the `--name` `my_app`
map port `-p`  `80` to port `9000`
from the image named `app`

To see our app inside the container we will need to know the ip of the virtual machine (boot2docker) to know that simply run:

```sh
$ boot2docker ip
```

Go to your browser and enter that ip, you should see the app.

##### Other Docker commands

To see running containers use `docker ps`

To see all containers use `docker ps -a`

To stop a container use `docker stop <container_id_or_name>`

To start an existing container use `docker start <container_id_or_name>`

To see the logs of a container use `docker logs -f <container_id_or_name>` `-f` is optional, will keep STDIN attached to current terminal

#### Push your image to DockerHub

We are going to add an Automated build repository in DockerHub, for that we first need to push the code to Github.

[See how to create a repository on github](https://help.github.com/articles/create-a-repo/)

Then link your Github account with DockerHub to add an automated build repo:

[See how to add automated build repo in DockerHub](https://docs.docker.com/userguide/dockerrepos/#automated-builds)

After adding your repo, you should see the build status of your image in the Build Details tab.

Creating an automated build repo means that every time you make a push to your github repo, a build will be trigger in DockerHub to build your new image.

In the next section we will see how to deploy your app in DigitalOcean automatically after each of those builds to publish the latest changes.

## Tutum & Continuous Delivery

[Tutum](https://www.tutum.co/) is a free forever platform that helps you manage your software deployment lifecycle into any cloud service provider.
