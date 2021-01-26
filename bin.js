#!/usr/bin/env node

import { forEach } from './index.js';

forEach(function (devServer) {
	console.log('starting dev server on port ' + devServer.get('port'));
	devServer.listen(devServer.get('port'));
});
