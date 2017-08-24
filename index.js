const debug = require('debug')('express-error-response');

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
        super(statusCode);
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
        if ('boolean' !== typeof config.json) {
            debug('config.json not set, defaulting to true');
            config.json = true;
        }
        if ('boolean' !== typeof config.catchAll) {
            debug('config.catchAll is not set, defaulting to false');
            config.catchAll = false;
        }
        if ('boolean' !== typeof config.endRequest) {
            debug('config.endRequest is not set, defaulting to true');
            config.endRequest = true;
        }

        const fn = config.json ? 'json' : 'send';

        if (config.logger && 'function' !== typeof config.logger)
            debug('config.logger is not a function and is silently ignored');

        if (config.logger && 'function' === typeof config.logger)
            config.logger(err);

        if (err instanceof RequestError) {
            debug('found instance of RequestError');
            res.status(err.code);
        } else {
            debug('the thrown Error was not a RequestError instance');
            if (config.catchAll) {
                debug('config.catchAll is enabled, setting 500');
                res.status(500);
            } else {
                debug('config.catchAll is disabled, calling next middleware');
                return next(err, req, res);
            }
        }

        if (err.body) {
            debug(
                `found a body inside the error with typeof ${typeof body}, calling res.${fn}`
            );
            res[fn](body);
        }

        if (config.endRequest) {
            debug('config.endRequest is enabled, ending request');
            res.end();
        }
    };
};

module.exports = catchMiddleware;
module.exports.RequestError = RequestError;
module.exports.statusCodes = statusCodes;
