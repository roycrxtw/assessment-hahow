const hero = require('./hero');
const info = require('./info');

module.exports = function routeBuilder(app) {
  app.use('/', info);
  app.use('/heroes', hero);
};
