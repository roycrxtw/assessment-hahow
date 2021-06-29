const express = require('express');
const asyncHandler = require('express-async-handler');

const basicAuth = require('app/middlewares/basicAuth');
const handler = require('app/handlers/hero');

const router = express.Router();

// router.get('/:heroId', basicAuth, asyncHandler(handler.getHero)); // todo
router.get('/', basicAuth, asyncHandler(handler.listHero));

module.exports = router;
