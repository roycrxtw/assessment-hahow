const _ = require('lodash');
const axios = require('axios').default;
const Joi = require('joi');

const logger = require('lib/Logger');
const Hero = require('app/models/Hero');

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

  static async doGet(url, retry = API_RETRY) {
    if (!url) throw new Error('缺少必要參數');

    if (retry < 0) { // 已經耗盡重試次數, 但都無法取得正確回應, 視為服務上出現錯誤丟出例外並記錄 error log.
      logger.error({ msg: 'doGet 已經耗盡重試次數, 但都無法取得 url 正確回應', url });
      throw new Error('暫時無法取得資料');
    }

    try {
      const res = await axios.get(url, this.requestOptions);
      logger.debug({ msg: 'Fetch result', retry, res: res.data });

      if (res.status === 404) { // 給定 url 找不到指定資料, 將不再重試並直接回傳 null
        return null;
      }

      if (res.status >= 500) { // 500 系列 http status code 時, 重試請求
        return this.doGet(url, retry - 1);
      }

      return res.data;
    } catch (ex) {
      logger.error({ msg: 'Error in doGet', errorMessage: ex.message, errorName: ex.name });
      return this.doGet(url, retry - 1);
    }
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
      if (!val) return acc; // 當 profile 無法取得時直接略過本筆資料
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
  static async getProfile(id) {
    if (!id) throw new Error('缺少必要參數');

    logger.info(`Get Hero Profile for id:${id}.`);

    const result = await this.doGet(`https://hahow-recruit.herokuapp.com/heroes/${id}/profile`);
    logger.debug({ msg: `Fetch result for id:${id}`, result });

    if (!result) return null;

    const profile = Hero.createProfile(result);
    if (!this.checkProfile(profile)) return null; // 若資料檢驗不合格, 亦拋棄本資料

    return { id, profile };
  }

  /**
   * 取得 Hero list.
   *
   * 本函式因套用 doGet 使用 retry 機制確保在遠端暫時無回應時可以再次進行嘗試
   * 若在 retry 耗盡時依舊無法取得列表, 則丟出例外提示目前狀態.
   */
  static async listHero() {
    const results = await this.doGet('https://hahow-recruit.herokuapp.com/heroes');
    return _.reduce(results, (acc, val) => {
      const hero = Hero.createHero(val);
      acc.push(hero);
      return acc;
    }, []);
  }

  static async getHero(id) {
    if (!id) throw new Error('缺少必要參數');

    const result = await this.doGet(`https://hahow-recruit.herokuapp.com/heroes/${id}`);
    return Hero.createHero(result);
  }
}

module.exports = HahowApiService;
