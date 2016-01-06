# Simple Dev Server

This is a simple dev server that works with webpack apps or without webpack. It is meant to make development easier and aims to end the prickly practice of running two servers in development.

## Usage 

### 1. Create `devserver.config.js`.

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
	port: 5450, // 3000 by default
};

```

All options are optional.

#### Options

* `proxy` - key/value pairs of URLs to servers to proxy requests. This allows you to work with an external API and/or image server.
* `publicPaths` - a key/value pair of URLs to the static file directories in which they are contained.
* `mockPath` - You can make a folder on your project that contains sample responses from your API calls. Paths that exist in this directory structure will be used instead of making HTTP calls.
* `app` - either an express app (such as your production app) or a file path to the index of a single page app.
* `port` - the port number that will be used.

### 2. Running it

#### As a Project Dependency (recommended)

The recommended way is to install it as a devDependency to your project, then save it as your `npm start` or `npm run dev` script.

```
npm install --save-dev simple-dev-server
```

Then add this to your package.json:
```json
{
  "name": "YourApp",
  "scripts": {
    "start": "./node_modules/.bin/simple-dev-server"
  }
}
```

#### As a global command

```
npm install -g simple-dev-server
```

Then you may simply run `simple-dev-server`

## Simple Config Examples

### Just Webpack
```
// Nothing, but you'll still need an empty file.
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
