const express = require('express');
const router = express.Router();
const { handleRefreshRequest } = require('../controllers/refreshController');

const { serveSummaryImage } = require('../controllers/imageController.js');

const { getAllCountries, getCountryByName, deleteCountryByName, getStatus } = require('../controllers/countryController');


router.post('countries/refresh', handleRefreshRequest)
router.get('/countries/image', serveSummaryImage);

router.get('/status', getStatus);
router.get('/countries', getAllCountries);
router.get('/countries/:name', getCountryByName);
router.delete('/countries/:name', deleteCountryByName);


module.exports = router;
