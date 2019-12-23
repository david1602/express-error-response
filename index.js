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
    preconditionFailed: 412,
    teapot: 418,
    internalServerError: 500,
    notImplemented: 501
};

const messages = {
    badRequest: "Bad request",
    unauthorized: "The request is available only for authenticated users",
    forbidden: "Required permission not found",
    notFound: "Requested resource does not exist",
    methodNotAllowed: "The requested method is not allowed on the resource",
    preconditionFailed: "Request precondition failed",
    teapot: "The server is a teapot",
    internalServerError: "Internal server error",
    notImplemented: "The functionality is not yet implemented"
};

const isNumber = num => !isNaN(num) && num !== -Infinity && num !== Infinity;

class RequestError extends Error {
    /**
    * RequestError Class constructor
    *
    * @param  {String|Number} statusCode   Status code for the response
    * @param  {Object|String} body         optional body that the response receives
    * @return {RequestError}               Instanced RequestError
    */
    constructor(statusCode, body) {
        super(statusCode);
        const isValidStatusCode = isNumber(parseFloat(statusCode)) || isNumber(parseFloat(statusCodes[statusCode]));
        this.code = isValidStatusCode ? (statusCodes[statusCode] || statusCode) : 500;
        this.body = body;
    }
}

/**
 * Returns a middleware function for expressjs
 *
 * @param  {Function} config.logger         logging function, defaulted to noop ( () => {} )
 * @param  {Boolean}  config.json           respond with JSON or string, default true
 * @param  {Boolean}  config.catchAll       Catch all errors (and end the request) or call next middleware?
 * @param  {Mixed}    config.defaultFail    Default value to respond with when the server throws a 500 and no
 *                                          body is specified
 * @return {Function}                       Middleware function
 */
const catchMiddleware = function (config) {

    if ('boolean' !== typeof config.json) {
        debug('config.json not set, defaulting to true');
        config.json = true;
    }
    if ('boolean' !== typeof config.catchAll) {
        debug('config.catchAll is not set, defaulting to false');
        config.catchAll = false;
    }
    if (!config.defaultFail) {
        debug(`config.defaultFail is not set, defaulting it to ${config.json ? '{}' : '\'\''}`);
        config.defaultFail = config.json ? {} : '';
    }

    const fn = config.json ? 'json' : 'send';

    if (config.logger && 'function' !== typeof config.logger)
        debug('config.logger is not a function and is silently ignored');

    return function (err, req, res, next) {

        if (config.logger && 'function' === typeof config.logger) config.logger(err);

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

        if (err.body)
            debug(`found a body inside the error with typeof ${typeof body}, calling res.${fn}`);

        res[fn](err.body || config.defaultFail);
    };
};


module.exports = catchMiddleware;
module.exports.RequestError = RequestError;
module.exports.statusCodes = statusCodes;
module.exports.messages = messages;

// Add utilities to directly throw all the registered errors
Object.keys(statusCodes).forEach(key => {
    module.exports[key] = function (error = { message: messages[key] }) {
        throw new RequestError(key, error);
    };
});
