# Simple Dev Server

This is a simple dev server that works with webpack apps or without webpack. It is meant to make development easier and aims to end the prickly practice of running two servers in development.

## Usage 

### Create `devserver.config.js`.

```javascript
module.exports = {
	proxy: {
		'/api/*': 'http://url.of.prod.api/'
	},
	publicPaths: {
		'/assets': 'assets'
	},
	mockPath: 'mock',
	app: '/index.html', // this can also be an express app
	serverConfig: {}, // config for webpack-hot-server-middleware
	port: 5450, // 3000 by default
};

```

All options are optional.

If you'd like to start more than one server with the same build (useful when making multiple apps) use an array of config objects instead of a single one.

If you're rendering on the server it will use [webpack-hot-server-middleware](https://github.com/60frames/webpack-hot-server-middleware) to recompile your server side code. Just be sure to have a server entry in your webpack config.

#### Options

* `proxy` - key/value pairs of URLs to servers to proxy requests. This allows you to work with an external API and/or image server.
* `publicPaths` - a key/value pair of URLs to the static file directories in which they are contained.
* `mockPath` - You can make a folder on your project that contains sample responses from your API calls. Paths that exist in this directory structure will be used instead of making HTTP calls.
* `app` - An express app or a string that will be used to server your single page app.
* `apps` - an array of apps, end with a string to serve a single page app. Ignored if `app` is present.
* `serverConfig` - used for webpack-hot-server-middleware if there's a server entry in your webpack config.
* `port` - the port number that will be used.

### 2. Running it

#### As a Project Dependency (recommended)

The recommended way is to install it as a devDependency to your project, then save it as your `npm start` or `npm run dev` script.

```
yarn add --dev simple-dev-server
```

Then add this to the "scripts" section of your package.json:
```json
{
  "name": "YourApp",
  "scripts": {
    "start": "simple-dev-server"
  }
}
```

and run `yarn start`

#### As a global command

```
yarn global add simple-dev-server
```

Then you may simply run `simple-dev-server`

## Simple Config Examples

### Just Webpack (even with isomoriphic)
```
// Nothing. It'll default to port 3000
```

### Serve a static directory and proxy your API and content images
```javascript
module.exports = {
	proxy: {
		'/api/*': 'http://url.of.prod/',
		'/usercontent/*': 'http://url.of.prod/'
	},
	publicPaths: {
		'/assets': 'assets'
	}
};
```

### A Webpack single page app
```javascript
module.exports = {
	proxy: {
		'/api/*': 'http://url.of.prod.api/',
	},
	app: '/index.html'
};
```
You can have webpack serve index.html using the `webpack-html-plugin`, if it doesn't exist in the build it will be served statically.

### Using a node app plus an index.html from the build
```javascript
var app = require('./back-end-express-app');

module.exports = {
	proxy: {
		'/api/*': 'http://url.of.prod.api/',
	},
	apps: [app, '/index.html']
};
```

