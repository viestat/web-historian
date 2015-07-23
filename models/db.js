//set up database
var fs = require('fs');
var file = "test.db";
var dbExists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
var _ = require('underscore');
var q = require('q');

db.serialize(function() {
  if(!dbExists) {
    db.run('CREATE TABLE pages (id INTEGER PRIMARY KEY, url TEXT)');
  }
});

module.exports = {
  insert : function (values) {
    console.log(values)
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO pages VALUES (?, ?)");
      stmt.run(values[0], values[1]);
      stmt.finalize();
    });
    db.close();
  },
  select : function (query) {
    var deferred = q.defer();
    var results = [];
    db.each("SELECT id, url FROM pages", function(err, row) {
      results.push({ id : row.id, url : row.url });
      console.log("got the data");
    }, function () {
      deferred.resolve(results);
    });
    return deferred.promise;
  }
};