const expect = require('expect');

const Hero = require('app/models/Hero');

describe('Hero.createHero', () => {
  test('return null if the input is undefined.', async () => {
    expect.assertions(1);

    const expected = null;

    const received = Hero.createHero();

    expect(received).toEqual(expected);
  });

  test('return null if the input is null.', async () => {
    expect.assertions(1);

    const expected = null;

    const received = Hero.createHero(null);

    expect(received).toEqual(expected);
  });
});
