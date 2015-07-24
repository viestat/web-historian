var path = require('path');
var url = require('url');
var fs = require('fs');
var q = require('q');
var archive = require('../helpers/archive-helpers');
var db = require('../models/db');
// require more modules/folders here!
var helpers = require('./http-helpers');
//requiere headers
var headers = helpers.headers;

var getFixture = function (fixtureName, cb) {
  var fixturePath = archive.paths.archivedSites + "/" + fixtureName;
  fs.exists(fixturePath, function (exists) {
    cb(exists, fixturePath);
  });
}

var sendResponse = function(res, data, statusCode, h) {
  var i;
  if (!h) {
    h = {};
  }
  for (i in headers) {
    if (! i in h) {
      h[i] = headers[i];
    }
  }
  statusCode = statusCode || 200;
  res.writeHead(statusCode, h);
  res.end(data);
};

var fileTypes = {
  "txt" : function () {
    return "text/text";
  },
  "html" : function () {
    return "text/html";
  },
  "css" : function () {
    return "text/css";
  },
  "json" : function () {
    return "application/json";
  },
  "jpg" : function () {
    return "image/jpeg";
  },
  "jpeg" : function () {
    return "image/jpeg";
  }
};

var routes = {
  "GET" : {
    "/" : function (cb) {
      fs.readFile(__dirname + "/public/index.html", "utf8", function (err, data) {
        if (err) {
          console.log(err);
        } else {
          cb(data);
        }
      });
    },
    "/sites" : function () {
      db.select().then(function (results) {
        console.log(results);
      }, function (err) {
        //do 500 error
      });
    },
    "/favicon.ico" : function (cb) {
      cb("Favicon");
    },
    "/archive" : function (cb) {
      cb(archive.paths.list);
    },
    "/loading" : function (cb) {
      fs.readFile(__dirname + "/public/loading.html", "utf8", function (err, data) {
        cb(data);
      });
    },
    "404" : function (cb) {
      cb("Page not found");
    },
    "500" : function (cb) {
      cb("Server error");
    }
  },
  "POST" : {
    "/" : function (cb, req, res) {
      var data = '';
      req.on('data', function (chunk) {
        data += chunk;
      });
      req.on('end', function() {
        var site;
        if (req.headers["content-type"] === 'application/json') {
          site = JSON.parse(data).url;
        } else {
          site = data.split("=")[1];
        }
        fs.appendFile(archive.paths.list, site + "\n", function (err) {
          var redirect = "http://127.0.0.1:8080/";
          if (err) {
            routes["GET"]["500"](function (message) {
              sendResponse(res, message);
            });
          } else {
            archive.isUrlArchived(site, function (exists) {
              if (exists) {
                sendResponse(res, "", 302, { location : redirect + site});
              } else {
                sendResponse(res, "", 302, { location : redirect + "loading"});
              }
            });
          }
        });//req.on
      });
    }
  }
};

exports.handleRequest = function (req, res) {

  var path = url.parse(req.url);
  var ext = path.path.split(".");

  if (ext[ext.length - 1] in fileTypes) {
    helpers.serveAssets(res, __dirname + "/public/" + path.path)
      .then(function (data) {
        sendResponse(res, data, 200, {"Content-Type" : fileTypes[ext[ext.length - 1]]()}); 
      });
  } else {
    getFixture(path.pathname.replace("/", ""), function (exists, filePath) {
      if (routes[req.method][path.path]) {
        routes[req.method][path.path](function (message) {
          sendResponse(res, message);
        }, req, res);
      } else if (exists) {
        fs.readFile(filePath, "utf8", function(err, data) {
          if (err) {
            routes["GET"]["500"](function (message) {
              sendResponse(res, message, 500);
            });
          } else {
            sendResponse(res, data);
          }
        });
      
      } else {
        routes["GET"]["404"](function (message) {
          sendResponse(res, message, 404);
        });
      }
    });    
  }

};
