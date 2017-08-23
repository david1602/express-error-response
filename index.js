/**
 * Resolve status codes as strings
 * to numbers as the expressjs response
 * sets the status with a number
 */

const statusCodes = {
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    methodNotAllowed: 405,
    preeconditionFailed: 412,
    internalServerError: 500
};

const isNumber = num => !isNaN(num) && num !== -Infinity && num !== Infinity;

/**
 * RequestError Class
 *
 * @param  {String|Number} statusCode   Status code for the response
 * @param  {Object} body                optional JSON body that the response receives
 * @return {RequestError}               Instanced RequestError
 */

const RequestError = function(statusCode, body) {
    const parsed = parseFloat(statusCode);
    if (
        !isNumber(parseFloat(statusCode)) &&
        !isNumber(parseFloat(statusCodes[statusCode]))
    )
        this.code = 500;
    else this.code = statusCodes[statusCode] || statusCode;
    this.body = body;
};

/**
 * Returns a middleware function for expressjs
 *
 * @param  {Function} config.logger     logging function, defaulted to console.log
 * @param  {Boolean} config.catchAll    Catch all errors or call next middleware?
 * @param  {Mixed} config.defaultBody   Default body overwrite
 * @param  {Boolean} config.endRequest  End the request?
 * @return {Function}                   Middleware function
 */

const catchMiddleware = function(config) {
    return function(err, req, res, next) {
        if (err instanceof RequestError) {
            res.status(err.code);
            res.json(err.body || config.defaultBody || {});
        } else {
            if (config.catchAll) {
                res.status(500);
            } else {
                return next(err, req, res);
            }
        }

        if (config.endRequest) res.end();
    };
};

module.exports = {
    statusCodes,
    catchMiddleware,
    RequestError
};
