
const express = require('express');
const router = express.Router();
const { handleRefreshRequest } = require('../controllers/refreshController');

router.post('/countries/refresh', handleRefreshRequest);

module.exports = router;
