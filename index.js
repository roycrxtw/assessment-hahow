const express = require('express');

const config = require('config/main');
const logger = require('lib/Logger');
const routeBuilder = require('app/routes/builder');
const requestEnricher = require('app/middlewares/requestEnricher');
const errorHandler = require('app/middlewares/errorHandler');

const app = express();
const { port } = config;

app.use(requestEnricher);

routeBuilder(app);

app.use(errorHandler);

// The Catch-All Error Handler
// 當指定路徑不存在時, 由此 handler 處理
// 找不到路徑時, 應實際回應 HTTP status code: 404
app.use('*', (req, res) => res.status(404).json({
  ok: false,
  msg: '指定路徑並不存在',
  error: {
    debugInfo: { uri: req.originalUrl },
    type: 'RouteNotFound',
  },
}));

app.listen(port, () => {
  logger.info(`The HaHow Assessment Project is listening on port ${port}`);
});
