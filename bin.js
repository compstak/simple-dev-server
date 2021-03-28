#!/usr/bin/env node

const server = require("./index.js");

server.forEach(function (devServer) {
  console.log("starting dev server on port " + devServer.get("port"));
  devServer.listen(devServer.get("port"));
});
