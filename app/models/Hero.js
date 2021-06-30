const Joi = require('joi');

class Hero {
  constructor({
    id, name, image, profile,
  }) {
    this.id = id;
    this.name = name;
    this.image = image;
    if (profile) this.profile = profile;
  }

  // 生成 Hero 物件, 透過本 factory function 去過濾掉有問題的資料
  static createHero(prop) {
    if (!prop) return null;

    const { id, name, image, profile } = prop;

    if (!id || !name || !image) {
      // ignore this bad data
      return null;
    }

    return new Hero({
      id, name, image, profile,
    });
  }

  // 生成 Profile 物件, 透過本方法過濾掉非預期資料
  static createProfile(prop) {
    if (!prop) return null;

    const schema = Joi.object({
      str: Joi.number().strict().required(),
      int: Joi.number().strict().required(),
      agi: Joi.number().strict().required(),
      luk: Joi.number().strict().required(),
    }).options({ stripUnknown: { arrays: false, objects: true } });
    const result = schema.validate(prop); // 當 validation result 存在 error 物件時代表驗證失敗
    if (result.error) return null;

    return { str: prop.str, agi: prop.agi, luk: prop.luk, int: prop.int };
  }
}

module.exports = Hero;
