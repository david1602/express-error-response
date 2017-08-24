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

class RequestError extends Error {
    /**
    * RequestError Class constructor
    *
    * @param  {String|Number} statusCode   Status code for the response
    * @param  {Object} body                optional JSON body that the response receives
    * @return {RequestError}               Instanced RequestError
    */
    constructor(statusCode, body) {
        super();
        const parsed = parseFloat(statusCode);
        if (
            !isNumber(parseFloat(statusCode)) &&
            !isNumber(parseFloat(statusCodes[statusCode]))
        )
            this.code = 500;
        else this.code = statusCodes[statusCode] || statusCode;
        this.body = body;
    }
}

/**
 * Returns a middleware function for expressjs
 *
 * @param  {Function} config.logger         logging function, defaulted to noop ( () => {} )
 * @param  {Boolean}  config.json           respond with JSON or string, default true
 * @param  {Boolean}  config.catchAll       Catch all errors or call next middleware?
 * @param  {Boolean}  config.endRequest     End the request?
 * @return {Function}                       Middleware function
 */

const catchMiddleware = function(config) {
    return function(err, req, res, next) {
        if ('boolean' !== typeof config.json) config.json = true;

        const fn = config.json ? 'json' : 'send';

        if (config.logger && 'function' === typeof config.logger)
            config.logger(err);

        if (err instanceof RequestError) {
            res.status(err.code);
        } else {
            if (config.catchAll) {
                res.status(500);
            } else {
                return next(err, req, res);
            }
        }
        if (err.body) res[fn](body);

        if (config.endRequest) res.end();
    };
};

module.exports = {
    statusCodes,
    catchMiddleware,
    RequestError
};
