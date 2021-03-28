import { join } from "path";
import { stat as _stat } from "fs";

import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotServerMiddleware from "webpack-hot-server-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import webpack from "webpack";

import express from "express";
import send from "send";

import httpProxy from "http-proxy";
var proxy = httpProxy.createProxyServer();

import supportsColor from "supports-color";

var cwd = process.cwd();

const getImport = async (path) => await import(path);

var isWebpack = true;
var devServerConfigs;
try {
  var webpackConfigPath = join(cwd, "webpack.config.js");
  var webpackConfig = getImport(webpackConfigPath);
  console.log(webpackConfigPath);
} catch (e) {
  console.error(e);
  isWebpack = false;
}

try {
  var devServerConfigPath = join(cwd, "devserver.config.js");
  console.log(devServerConfigPath);
  devServerConfigs = getImport(devServerConfigPath);
} catch (e) {
  console.error(e);
  devServerConfigs = {};
}

var compiler;

var webpackDevServer;
if (isWebpack) {
  compiler = webpack(webpackConfig);
  var middlewareOptions = {
    stats: {
      //   preset: "minimal",
      colors: supportsColor,
    },
    publicPath: webpackConfig.output?.publicPath ?? "/",
  };

  webpackDevServer = webpackDevMiddleware(compiler, middlewareOptions);
}

if (!Array.isArray(devServerConfigs)) {
  devServerConfigs = [devServerConfigs];
}

export default devServerConfigs.map(function (devServerConfig) {
  var devServer = express();

  // use mock data if it exists
  if (devServerConfig.mockPath) {
    console.log("Using " + devServerConfig.mockPath + " for mock data.");
    devServer.use("*", function (req, res, next) {
      var mockPath = join(cwd, devServerConfig.mockPath, req.originalUrl);

      _stat(mockPath, function (err, stat) {
        if (err) {
          _stat(mockPath + ".json", function (err, stat) {
            if (err) {
              next();
              return;
            }

            if (stat.isFile()) {
              console.log("serving mock for " + req.originalUrl);
              send(req, mockPath + ".json").pipe(res);
            } else {
              next();
            }
          });
          return;
        }

        if (stat.isFile()) {
          console.log("serving mock for " + req.originalUrl);
          send(req, mockPath).pipe(res);
        } else {
          next();
        }
      });
    });
  }

  if (isWebpack) {
    devServer.use(webpackDevServer);
    devServer.use(webpackHotMiddleware(compiler));
  }

  // use file if exists
  if (devServerConfig.publicPaths) {
    var paths = Object.keys(devServerConfig.publicPaths);

    paths.forEach(function (path) {
      console.log(
        "Serving static data on " +
          path +
          " from " +
          devServerConfig.publicPaths[path]
      );
      devServer.use(path, express.static(devServerConfig.publicPaths[path]));
    });
  }

  // use proxy
  if (devServerConfig.proxy) {
    var paths = Object.keys(devServerConfig.proxy);

    proxy.on("error", function (e) {
      console.log("Error in proxy!");
      console.error(e);
    });

    paths.forEach(function (path) {
      console.log("proxying " + path + " to " + devServerConfig.proxy[path]);
      devServer.all(path, function (req, res, next) {
        var proxyOptions = {
          target: devServerConfig.proxy[path],
          changeOrigin: true,
        };
        proxy.web(
          req,
          res,
          proxyOptions,
          function (err) {
            console.log(err.message);
            if (!res.headersSent) {
              res.writeHead(502, { "content-type": "application/json" });
            }
            res.end(
              JSON.stringify({ error: "proxy_error", reason: err.message })
            );
          }.bind(this)
        );
      });
    });
  }

  if (devServerConfig.app) {
    devServerConfig.apps = [devServerConfig.app];
  }

  var apps = devServerConfig.apps || [];

  if (
    Array.isArray(webpackConfig) &&
    webpackConfig.find((c) => c.name === "server")
  ) {
    devServer.use(
      webpackHotServerMiddleware(compiler, devServerConfig.serverConfig)
    );
  }

  apps.forEach(function (app) {
    // use app if not SPA
    if (app && typeof app !== "string") {
      console.log("Using the specified express app.");
      devServer.use(app);
    }

    // use SPA
    if (app && typeof app === "string") {
      console.log("Serving " + app + " as your single page app.");
      if (isWebpack) {
        devServer.get("*", function (req, res, next) {
          req.url = app;
          webpackDevServer(req, res, next);
        });
      }

      devServer.get("*", function (req, res) {
        send(req, app).pipe(res);
      });
    }
  });

  devServer.set("port", devServerConfig.port || 3000);
  return devServer;
});
