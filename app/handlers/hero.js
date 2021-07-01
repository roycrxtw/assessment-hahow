const Joi = require('joi');

const HahowApiService = require('lib/HahowApiService');
const logger = require('lib/Logger');

/**
 * @api {get} /heroes/:id [Hero] Get Hero
 * @apiDescription 取得指定 Hero 資料, 當為認證使用者時, 將會額外包含 Hero 之 profile 資料.
 *
 * @apiName GetHeroObject
 * @apiGroup Hero
 * @apiVersion 1.0.0
 * @apiSampleRequest off
 *
 * @apiSuccessExample Success
 * { // 若使用者通過認證時, 將會包含 profile 欄位
 *   "id": "1",
 *   "name": "Daredevil",
 *   "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
 *   "profile": {
 *       "str": 2,
 *       "int": 7,
 *       "agi": 9,
 *       "luk": 7
 *   }
 * }
 */
async function getHero(req, res) {
  // Path parameter checks
  const schema = Joi.object({
    heroId: Joi.number().integer().required(),
  }).options({ stripUnknown: false });
  await schema.validateAsync(req.params); // 當驗證失敗時會直接丟出 joi error.

  const { heroId } = req.params;
  let hero = await HahowApiService.getHero(heroId);
  logger.info({ msg: 'Get hero', hero });

  if (!hero) return res.json({ msg: '找不到指定英雄' });

  if (req.isUserAuth) {
    const heroes = await HahowApiService.attachProfiles([hero]);
    hero = heroes[0];
  }

  return res.json(hero);
}

/**
 * @api {get} /heroes [Hero] Get Hero List
 * @apiDescription 取得 Hero 列表, 當為認證使用者時, 將會額外包含 Hero 之 profile 資料.
 *
 * @apiName GetHeroList
 * @apiGroup Hero
 * @apiVersion 1.0.0
 * @apiSampleRequest off
 *
 * @apiSuccessExample Success
 * {
 *   "heroes": [
 *     {
 *       "id": "1",
 *       "name": "Daredevil",
 *       "image": "http://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
 *       "profile": {
 *           "str": 2,
 *           "int": 7,
 *           "agi": 9,
 *           "luk": 7
 *       }
 *     },
 *     ...omitted
 *   ]
 * }
 */
async function listHero(req, res) {
  let heroes = await HahowApiService.listHero();

  if (req.isUserAuth) {
    heroes = await HahowApiService.attachProfiles(heroes);
  }

  res.json({ heroes });
}

module.exports = {
  getHero,
  listHero,
};
