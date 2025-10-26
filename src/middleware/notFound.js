
function notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.name = 'NotFoundError';
    res.status(404);
    next(error);
}

module.exports = notFound;
