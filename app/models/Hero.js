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
  static createHero({
    id, name, image, profile = null,
  }) {
    if (!id || !name || !image) {
      // ignore this bad data
      return null;
    }

    return new Hero({
      id, name, image, profile,
    });
  }
}

module.exports = Hero;
