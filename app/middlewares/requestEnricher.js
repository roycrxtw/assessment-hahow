const logger = require('lib/Logger');

function requestEnricher(req, res, next) {
  const requestMethod = req.method;
  const requestURL = req.originalUrl;
  const requestTime = new Date();
  req.requestTime = requestTime;

  logger.info(`Request started: ${requestMethod} ${requestURL} at ${requestTime.toISOString()}`);
  next();
}

module.exports = requestEnricher;
