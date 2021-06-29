const HahowApiService = require('lib/HahowApiService');

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
  listHero,
};
