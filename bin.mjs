#!/usr/bin/env node

import server from "./index.mjs";

server.forEach(function (devServer) {
  console.log("starting dev server on port " + devServer.get("port"));
  devServer.listen(devServer.get("port"));
});
