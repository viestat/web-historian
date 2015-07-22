var path = require('path');
var url = require('url');
var fs = require('fs');
var q = require('q');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
//requiere headers

var getFixture = function (fixtureName, cb) {
  var fixturePath = archive.paths.archivedSites + "/" + fixtureName;
  fs.exists(fixturePath, function (exists) {
    cb(exists, fixturePath);
  });
}

var sendResponse = function(res, data, statusCode){
  statusCode = statusCode || 200;
  res.writeHead(statusCode, headers);
  res.end(data);
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
    "/favicon.ico" : function (cb) {
      cb("Favicon");
    },
    "archive" : function (cb) {
      cb(archive.paths.list);
    },
    "404" : function (cb) {
      cb("Page not found");
    },
    "500" : function (cb) {
      cb("Server error");
    }
  },
  "POST" : {
    "/" : function (cb) {
      var data = '';
      req.on('data', function (chunk) {
        data += chunk;
      });
      req.on('end', function(){
        cb(data);
      });
    }
  }
};

exports.handleRequest = function (req, res) {


  var path = url.parse(req.url);

  //if there is /[website]
  getFixture(path.pathname.replace("/", ""), function (exists, filePath) {
    if (routes[req.method][path.path]) {
      routes[req.method][path.path](function (message) {
        sendResponse(res, message);
      });
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
  

};



var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
