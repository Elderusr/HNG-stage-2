const refreshService = require('../services/refreshService');
const { generateSummaryImage } = require('../services/imageService');

async function handleRefreshRequest(req, res, next) {
	try {
		console.log('Refresh request received, Fetching data...');
		const result = await refreshService.fetchAndCacheData();

		try {
		await generateSummaryImage();
	} catch (imageError) {
		console.error('Failed to generate summary image:', imageError);
		throw new Error('Failed to generate summary image after data refresh.');
	}

		res.status(200).json({
			status: "success",
			totalCountries: result.total,
			lastRefreshedAt: result.timestamp,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = { handleRefreshRequest };
