const axios = require('axios').default;
const expect = require('expect');
const sinon = require('sinon');

const HahowApiService = require('lib/HahowApiService');

describe('HahowApiService.listHero', () => {
  test('return a hero list', async () => {
    const fakedApiResponse = { data: [{ id: 1, name: 'Belfast', image: 'faked-url' }] };
    const expected = [
      { id: 1, name: 'Belfast', image: 'faked-url' },
    ];
    const stub = sinon.stub(axios, 'get').resolves(fakedApiResponse);
    const received = await HahowApiService.listHero();

    expect(received).toEqual(expected);
    expect(stub.callCount).toBe(1);

    stub.restore();
  });

  test('return hero list with retry mechanism.', async () => {
    // 假定前 2 次呼叫都失敗, 第 3 次呼叫才成功
    const fakedApiResponse = { data: [{ id: 1, name: 'Belfast', image: 'faked-url' }] };
    const expected = [
      { id: 1, name: 'Belfast', image: 'faked-url' },
    ];
    const stub = sinon.stub(axios, 'get');
    stub.onCall(0).rejects();
    stub.onCall(1).rejects();
    stub.onCall(2).resolves(fakedApiResponse);

    const received = await HahowApiService.listHero();
    expect(received).toEqual(expected);
    expect(stub.callCount).toBe(3);

    stub.restore();
  });

  test('throw error if the api retry is exhausted', async () => {
    const stub = sinon.stub(axios, 'get').rejects();

    try {
      await HahowApiService.listHero();
    } catch (e) {
      expect(e.message).toMatch('暫時無法取得資料');
    }
    expect(stub.callCount).toBe(4); // 驗證執行次數: 1 + retry 3 times

    stub.restore();
  });
});

describe('HahowApiService.checkProfile', () => {
  test('return false if the required attribute is missing', () => {
    const profile = { str: 1 };
    const received = HahowApiService.checkProfile(profile);
    expect(received).toBe(false);
  });

  test('return false if the attribute type is not number', () => {
    const profile = {
      str: '3', int: 2, luk: 3, agi: 4,
    };
    const received = HahowApiService.checkProfile(profile);
    expect(received).toBe(false);
  });

  test('return true if the profile is fine', () => {
    const profile = {
      str: 1, int: 2, luk: 3, agi: 4,
    };
    const received = HahowApiService.checkProfile(profile);
    expect(received).toBe(true);
  });

  test('ignore unexpected fields', () => {
    const profile = {
      str: 1, int: 2, luk: 3, agi: 4, foo: 'bar',
    };
    const received = HahowApiService.checkProfile(profile);
    expect(received).toBe(true);
  });
});

describe('HahowApiService.attachProfiles', () => {
  test('return heroes with profile attached', async () => {
    const heroes = [
      { id: 1, name: 'Eagle' },
      { id: 2, name: 'Cat' },
    ];
    const fakedReturns = [
      {
        id: 1,
        profile: {
          str: 10, int: 4, agi: 6, luk: 6,
        },
      },
      {
        id: 2,
        profile: {
          str: 5, int: 5, agi: 5, luk: 10,
        },
      },
    ];
    const stub = sinon.stub(HahowApiService, 'getProfile');
    stub.onCall(0).resolves(fakedReturns[0]);
    stub.onCall(1).resolves(fakedReturns[1]);

    const expected = [
      {
        id: 1,
        name: 'Eagle',
        profile: {
          luk: 6, str: 10, int: 4, agi: 6,
        },
      },
      {
        id: 2,
        name: 'Cat',
        profile: {
          luk: 10, str: 5, int: 5, agi: 5,
        },
      },
    ];
    const received = await HahowApiService.attachProfiles(heroes);
    expect(received).toEqual(expected);
    stub.restore();
  });

  test('return heroes even if the corresponding profile is missing', async () => {
    const heroes = [
      { id: 1, name: 'Dog' },
      { id: 2, name: 'Bag' }, // 假設 Bag 這個 Hero profile 不存在
    ];

    const fakedReturns = [
      {
        id: 1,
        profile: {
          str: 8, int: 4, agi: 6, luk: 6,
        },
      },
    ];

    const expected = [
      {
        id: 1,
        name: 'Dog',
        profile: {
          str: 8, int: 4, agi: 6, luk: 6,
        },
      },
      {
        id: 2,
        name: 'Bag',
      },
    ];

    const stub = sinon.stub(HahowApiService, 'getProfile');
    stub.onCall(0).resolves(fakedReturns[0]);
    stub.onCall(1).resolves(null);

    const received = await HahowApiService.attachProfiles(heroes);
    expect(received).toEqual(expected);
    stub.restore();
  });
});

describe('HahowApiService.getHero', () => {
  test('throw Error if parameter: id is missing.', async () => {
    try {
      await HahowApiService.getHero();
    } catch (err) {
      expect(err.message).toMatch('缺少必要參數');
    }
  });

  test('return hero for a given id', async () => {
    const fakedResponse = { data: { id: 1, name: 'Black Knight', image: 'faked-url' } };
    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);
    const expected = {
      id: 1,
      name: 'Black Knight',
      image: 'faked-url',
    };
    const received = await HahowApiService.getHero(1);
    expect(received).toEqual(expected);
    stub.restore();
  });

  test('filter unexpected fields', async () => {
    const fakedResponse = {
      data: {
        id: 1, name: 'Black Knight', image: 'faked-url', foo: 'bar',
      },
    };
    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);
    const expected = {
      id: 1,
      name: 'Black Knight',
      image: 'faked-url',
    };
    const received = await HahowApiService.getHero(1);
    expect(received).toEqual(expected);
    stub.restore();
  });

  test('return null if any required field is missing.', async () => {
    const fakedResponse = {
      data: {
        image: 'only-this-faked-url',
      },
    };
    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);
    const expected = null;

    const received = await HahowApiService.getHero(1);
    expect(received).toEqual(expected);

    stub.restore();
  });

  test('throw error if the api retry is exhausted', async () => {
    const stub = sinon.stub(axios, 'get').rejects();

    try {
      await HahowApiService.getHero(1);
    } catch (e) {
      expect(e.message).toMatch('暫時無法取得資料');
    }
    expect(stub.callCount).toBe(4); // 驗證執行次數: 1 + retry 3 times

    stub.restore();
  });

  test('throw null if the api result is invalid', async () => {
    expect.assertions(1);

    const fakedResponse = { status: 200, data: { foo: 'bar' } };
    const expected = null;

    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);

    const received = await HahowApiService.getHero(1);
    expect(received).toEqual(expected);
    stub.restore();
  });
});

describe('HahowApiService.doGet', () => {
  test('throw Error if parameter: url is missing.', async () => {
    expect.assertions(1);

    try {
      await HahowApiService.doGet({ url: null });
    } catch (err) {
      expect(err.message).toMatch('缺少必要參數');
    }
  });

  test('throw Error if retry is exhausted.', async () => {
    expect.assertions(1);
    const stub = sinon.stub(axios, 'get').rejects();
    try {
      await HahowApiService.doGet({ url: 'faked-url' });
    } catch (err) {
      expect(err.message).toMatch('暫時無法取得資料');
    }
    stub.restore();
  });

  test('return null if API returns 404 status code.', async () => {
    expect.assertions(1);

    const fakedResponse = { status: 404 };
    const expected = null;

    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);

    const received = await HahowApiService.doGet({ url: 'faked-url' });
    expect(received).toEqual(expected);

    stub.restore();
  });

  test('return throw Error if API response a 500-series code.', async () => {
    expect.assertions(1);

    const fakedResponse = { status: 500 };
    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);

    try {
      await HahowApiService.doGet({ url: 'faked-url' });
    } catch (err) {
      expect(err.message).toMatch('暫時無法取得資料');
    }

    stub.restore();
  });

  test('return expected result with retry mechanism.', async () => {
    // 假定前兩次請求都失敗, 但透過 retry 機制應正確回傳預期結果
    expect.assertions(1);

    const fakedApiResponse = { status: 200, data: { balance: 3000 } };
    const expected = { balance: 3000 };

    const stub = sinon.stub(axios, 'get');
    stub.onCall(0).rejects();
    stub.onCall(1).rejects();
    stub.onCall(2).resolves(fakedApiResponse);

    const received = await HahowApiService.doGet({ url: 'faked-url' });
    expect(received).toEqual(expected);

    stub.restore();
  });
});

describe('HahowApiService.getProfile', () => {
  test('throw Error if parameter: id is missing.', async () => {
    expect.assertions(1);

    try {
      await HahowApiService.getProfile();
    } catch (err) {
      expect(err.message).toMatch('缺少必要參數');
    }
  });

  test('throw Error if retry is exhausted.', async () => {
    expect.assertions(1);
    const stub = sinon.stub(axios, 'get').rejects();
    try {
      await HahowApiService.getProfile(1);
    } catch (err) {
      expect(err.message).toMatch('暫時無法取得資料');
    }
    stub.restore();
  });

  test('return null if API returns 404 status code.', async () => {
    expect.assertions(1);

    const fakedResponse = { status: 404 };
    const expected = null;

    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);

    const received = await HahowApiService.getProfile(1);
    expect(received).toEqual(expected);

    stub.restore();
  });

  test('return throw Error if API response a 500-series code.', async () => {
    expect.assertions(1);

    const fakedResponse = { status: 500 };
    const stub = sinon.stub(axios, 'get').resolves(fakedResponse);

    try {
      await HahowApiService.getProfile('faked-url');
    } catch (err) {
      expect(err.message).toMatch('暫時無法取得資料');
    }

    stub.restore();
  });

  test('return expected result with retry mechanism.', async () => {
    // 假定前兩次請求都失敗, 但透過 retry 機制應正確回傳預期結果
    expect.assertions(1);

    const fakedApiResponse = {
      status: 200,
      data: {
        int: 1, str: 1, luk: 1, agi: 1,
      },
    };
    const expected = {
      id: 1,
      profile: {
        int: 1, str: 1, luk: 1, agi: 1,
      },
    };

    const stub = sinon.stub(axios, 'get');
    stub.onCall(0).rejects();
    stub.onCall(1).rejects();
    stub.onCall(2).resolves(fakedApiResponse);

    const received = await HahowApiService.getProfile(1);
    expect(received).toEqual(expected);

    stub.restore();
  });

  test('filter unexpected fields.', async () => {
    expect.assertions(1);

    const fakedApiResponse = {
      status: 200,
      data: {
        int: 1, str: 1, luk: 1, agi: 1, foo: 'bar',
      },
    };
    const expected = {
      id: 1,
      profile: {
        int: 1, str: 1, luk: 1, agi: 1,
      },
    };

    const stub = sinon.stub(axios, 'get');
    stub.onCall(0).rejects();
    stub.onCall(1).rejects();
    stub.onCall(2).resolves(fakedApiResponse);

    const received = await HahowApiService.getProfile(1);
    expect(received).toEqual(expected);

    stub.restore();
  });
});
