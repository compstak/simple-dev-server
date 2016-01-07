#!/usr/bin/env node

var devServer = require('./index');

devServer.listen(devServer.get('port'));
