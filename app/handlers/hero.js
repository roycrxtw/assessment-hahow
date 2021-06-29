const _ = require('lodash');

const HahowApiService = require('lib/HahowApiService');
const Hero = require('app/models/Hero');

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

  // 透過 reducer 過濾掉不符合規範之資料
  heroes = _.reduce(heroes, (acc, val) => {
    const h = Hero.createHero(val);
    if (h) acc.push(h);
    return acc;
  }, []);

  res.json({ heroes });
}

module.exports = {
  listHero,
};
