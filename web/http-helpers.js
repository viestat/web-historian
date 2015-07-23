var path = require('path');
var fs = require('fs');
var q = require('q');
var archive = require('../helpers/archive-helpers');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(res, asset) {
  var deferred = q.defer();
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
  fs.readFile(asset, function (err, data) {
    if (err) {
      deferred.reject(err);
    } else {
       deferred.resolve(data);
    }
  });
  return deferred.promise;
};



// As you progress, keep thinking about what helper functions you can put here!
