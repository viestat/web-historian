var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');
var db = require('../models/db');
/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  archivedScreenshots: path.join(__dirname, '../archives/screenshots'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(cb) {
  fs.readFile(exports.paths.list, "utf8", function (err, data) {
    var urls = data.split("\n");
    cb(urls);
  });
};

exports.isUrlInList = function(url, cb) {
  var result = false;
  this.readListOfUrls(function (urls) {
    _.each(urls, function (u) {
      if (u === url) {
        result = true;
      }
    });
    cb(result);
  });
};

exports.addUrlToList = function(url, cb){
  this.isUrlInList(url, function (result) {
    if (!result) {
      fs.appendFile(exports.paths.list, url, function(err) {
        if (err) {
          cb(false);
        } else {
          cb(true);
        }
      });//appendFile
    } else {
      cb(true);
    }
  });
};

exports.isUrlArchived = function(url, cb) {
  fs.exists(exports.paths.archivedSites + "/" + url, function(exists){
    cb(exists);
  });
};

exports.downloadUrls = function(urls){

  _.each(urls, function (url) {

    exports.isUrlArchived(url, function (exists) {

      var options;
      var callback;

      if (!exists) {

        options = {
          host: url,
          path: ''
        };

        callback = function(response) {

          //check if response has redirected, get that redirect

          var data = '';

          response.on('data', function (chunk) {
            data += chunk;
          });

          response.on('end', function () {
            fs.writeFile(exports.paths.archivedSites + "/" + url, data, function (err) {
              if (err) {
                console.log(err);
              } else {
                var imgOptions = {
                  host: "localhost",
                  port: "8000",
                  path: "/?url=" + url
                };
                var imgData = '';

                var cb = function (r) {

                  r.on('data', function (chunk) {
                    imgData += chunk;
                  });

                  r.on('end', function () {
                    fs.writeFile(exports.paths.archivedScreenshots + "/" + url + ".png", imgData, function (err) {
                      if (err) {
                        console.log(err);
                      } else {
                        db.insert([Date.now(), exports.paths.archivedSites + "/" + url]);
                      }
                    });
                  });
                }
                //do a request for image
                http.request(imgOptions, cb).end();
              } //else
            });
          });
        }

        http.request(options, callback).end();


      } //if

    }); //exports.isUrlArchived

  }); //each

};
