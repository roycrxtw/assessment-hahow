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
  static createProfile({ str, agi, luk, int }) {
    return { str, agi, luk, int };
  }
}

module.exports = Hero;
