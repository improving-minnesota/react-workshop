/**
 * Module dependencies.
 */
var redirect = require('response-redirect');


/**
 * Expose `redirect()` function on response.
 *
 * @return {Function}
 * @api public
 */
module.exports = function() {
  return function(req, res, next) {
    res.redirect = redirect;
    next();
  }
}
