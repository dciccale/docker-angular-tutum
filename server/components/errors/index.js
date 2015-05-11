/**
 * Error responses
 */

'use strict';

var path = require('path');
var config = require('../../config');

module.exports[404] = function pageNotFound(req, res) {
  var viewFilePath = path.join(config.root, 'server/views/404.html');
  var statusCode = 404;
  var result = {
    status: statusCode
  };

  res.status(result.status);
  res.sendFile(viewFilePath, function (err) {
    // if the file doesn't exist of there is an error reading it just return a json with the error
    if (err) {
      return res.json(result, result.status);
    }
  });
};
