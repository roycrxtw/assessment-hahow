const express = require('express');

const logger = require('lib/Logger');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ msg: 'Hello from roycrxtw' });
});

router.get('/about', (req, res) => {
  logger.debug('accessing about api');
  res.json({ msg: 'Hahow Assessment Project by roycrxtw' });
});

router.use('/apidoc', express.static('static/apidoc'));

module.exports = router;
