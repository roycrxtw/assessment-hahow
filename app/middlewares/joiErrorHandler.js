const _ = require('lodash');

const logger = require('lib/Logger');

function joiErrorHandler(err, req, res, next) {
  if (err.name === 'ValidationError' && err.isJoi) {
    logger.info({ msg: 'Joi Error caught.', err });
    const detail = err.details[0];
    const key = _.get(detail, 'path').join('.');
    if (detail.type === 'any.required') {
      return res.status(400).json({ ok: false, msg: `缺少必要欄位:${key}` });
    }
    return res.status(400).json({ ok: false, msg: `欄位 ${key} 不符合規範` });
  }
  return next(err);
}
module.exports = joiErrorHandler;
