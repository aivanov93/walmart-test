// Functions for creating server responses
// such as success or error
var utils = (function () {

  var _utils = {};

  /**
  *  Send a success respond to the client with the given
  * content
  */
  _utils.sendSuccess = function(res, content) {
    res.status(200).json({
      success: true,
      content: content
    }).end();
  };

  /**
  * Send an error response with the given errorCode and error message
  */
  _utils.sendError = function(res, errorCode, error) {
    res.status(errorCode).json({
      success: false,
      error: error
    }).end();
  };

  Object.freeze(_utils);
  return _utils;
})();

module.exports = utils;
