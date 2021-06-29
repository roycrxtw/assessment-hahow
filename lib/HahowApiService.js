const _ = require('lodash');
const axios = require('axios').default;
const Joi = require('joi');

const logger = require('lib/Logger');

const API_RETRY = 3;

class HahowApiService {
  static get requestOptions() {
    return {
      timeout: 5000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * 嘗試附加 profile 至 heroes 上
   * 若 hero 無對應 profile 時, 將不對該 hero 設定 profile.
   */
  static async attachProfiles(heroes) {
    const promiseList = [];
    for (const hero of heroes) {
      promiseList.push(this.getProfile(hero.id));
    }
    const results = await Promise.all(promiseList);

    const map = _.reduce(results, (acc, val) => {
      if (!val) return acc;
      acc[val.id] = val.profile;
      return acc;
    }, {});
    for (const hero of heroes) {
      hero.profile = map[hero.id];
    }
    return heroes;
  }

  /**
   * 驗證 profile 資料結構
   * profile structure: {str: number, int: number, agi: number, luk: number}
   * @returns {boolean} false if validation failed.
   */
  static checkProfile(profile) {
    const schema = Joi.object({
      str: Joi.number().strict().required(),
      int: Joi.number().strict().required(),
      agi: Joi.number().strict().required(),
      luk: Joi.number().strict().required(),
    }).options({ stripUnknown: { arrays: false, objects: true } });
    const result = schema.validate(profile); // 當 validation result 存在 error 物件時代表驗證失敗
    return !(result.error);
  }

  /**
   * 嘗試取得 Hero profile
   * 若給定 id 並沒有對應 profile, 或耗盡 retry 次數時, 則直接回傳 null.
   */
  static async getProfile(id, retry = API_RETRY) {
    if (retry < 0) { // 已經耗盡重試次數, 但都無法取得正確回應, 則直接回傳 null 並記錄 error log.
      logger.error(`Hero:${id} 已經耗盡重試次數, 但都無法取得 profile 正確回應`);
      return null;
    }

    logger.info(`Get Hero Profile for id:${id} with retry:${retry}`);

    try {
      const res = await axios.get(`https://hahow-recruit.herokuapp.com/heroes/${id}/profile`, this.requestOptions);
      logger.debug({ msg: `Fetch result for id:${id}`, res: res.data });

      const profile = res.data;

      if (res.status === 404) { // 給定 id 找不到指定 profile, 不再重試 直接回傳 null
        return null;
      }

      if (res.status !== 200) {
        return this.getProfile(id, retry - 1);
      }

      if (!this.checkProfile(profile)) return this.getProfile(id, retry - 1);

      return { id, profile: res.data };
    } catch (ex) {
      logger.error({ msg: 'Error in getProfile', errorMessage: ex.message, errorName: ex.name });
      return this.getProfile(id, retry - 1);
    }
  }

  /**
   * 取得 Hero list.
   *
   * 本函式使用 retry 機制確保在遠端暫時無回應時可以再次進行嘗試
   * 若在 retry 耗盡時依舊無法取得列表, 則丟出例外提示目前狀態.
   */
  static async listHero(retry = API_RETRY) {
    if (retry < 0) {
      logger.error('已經耗盡重試次數, 但都無法取得正確回應');
      throw new Error('暫時無法取得資料');
    }

    try {
      const res = await axios.get('https://hahow-recruit.herokuapp.com/heroes', this.requestOptions);
      logger.debug({ msg: 'fetch result', res: res.data, retry });
      return res.data;
    } catch (ex) {
      logger.error({ msg: 'Error in listHero', errorMessage: ex.message, errorName: ex.name });
      return this.listHero(retry - 1);
    }
  }
}

module.exports = HahowApiService;