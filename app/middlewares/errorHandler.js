/* eslint no-unused-vars: "off" */

const logger = require('lib/Logger');

function errorHandler(err, req, res, next) {
  logger.error({ msg: 'Exception', err });
  res.status(500);
  return res.json({ ok: false, msg: 'Request Failed', data: err.msg || err.message });
}

module.exports = errorHandler;
