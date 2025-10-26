const ApiError = require('./ApiError');

function globalErrorHandler(error, req, res, next) {
	console.error('--- Global Error Handler ---');
	console.error(error.stack);
	

	if (error instanceof ApiError) {
		return res.status(503).json({
			error: "External data source unavailable",
			details: error.message,
		});
	}

	if (error.name === 'sequelizeValidationError' || error.name === 'sequelizeUniqueConstraintError') {
		const details = {};
		error.errors.forEach(err => {
			details[err.path] = err.message;
		});
		return res.status(400).json({
			error: "Validation failed",
			details: details,
		});
	}

	if (error.name === 'NotFoundError') {
		return res.status(404).json({
			error: error.message,
		});
	}


	return res.status(500).json({
		error: "Internal server error",
	});
}


module.exports = globalErrorHandler;
