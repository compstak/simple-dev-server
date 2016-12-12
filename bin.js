#!/usr/bin/env node

var devServers = require('./index');

devServers.forEach(function (devServer) {
	console.log('starting dev server on port ' + devServer.get('port'));
	devServer.listen(devServer.get('port'));
});
