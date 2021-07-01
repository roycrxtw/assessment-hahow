const _ = require('lodash');
const Joi = require('joi');

const logger = require('lib/Logger');
const { default: axios } = require('axios');

/**
 * 身份認證
 * 透過 name and password 呼叫遠端 api 進行身份認證
 * 當有任何非預期結果時皆視為未驗證身份, 且不使用 retry.
 */
async function basicAuth(req, res, next) {
  let isAuth = false;

  const name = _.trim(_.get(req, 'headers.name'));
  const password = _.trim(_.get(req, 'headers.password'));

  // Auth parameter checks
  try {
    const schema = Joi.object({
      name: Joi.string().alphanum().allow('').max(100),
      password: Joi.string().alphanum().allow('').max(100),
    }).options({ stripUnknown: true });
    await schema.validateAsync(req.headers);
  } catch (e) {
    // 當驗證失敗時會丟出 joi error, 因為在 middleware 中故需要擷取起來並傳給 next 才可以正確地讓 express 提示使用者輸入資料存在問題
    return next(e);
  }

  logger.info({ msg: `Accessing API with user:${name}` });

  if (!name || !password) return next();

  try {
    const authResult = await axios.post('https://hahow-recruit.herokuapp.com/auth', { name, password });

    if (authResult.status === 200 && authResult.statusText === 'OK') {
      isAuth = true;
      logger.info(`This user:${name} is authenticated.`);
    }
  } catch (err) {
    // 當連線錯誤時, 或遠端 API server 連線出現錯誤時, 一律視為沒有認證身份, 避免任意取得未授權資料, 僅紀錄 error logs.
    logger.error({ msg: 'Error in HaHow API Auth', err });
  }

  req.isUserAuth = isAuth;

  return next();
}

module.exports = basicAuth;
