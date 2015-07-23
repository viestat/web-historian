// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var CronJob = require('cron').CronJob;
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var http = require('http');

module.exports = function () {
  new CronJob('59 * * * * *', function() {
    archive.readListOfUrls(archive.downloadUrls);
  }, null, true, "America/Los_Angeles");
}