# express-error-response
Error utility and catching middleware for HTTP errors in expressjs

## Installation
```
$ npm install express-error-response
```

## Usage
`express-error-response` exposes a function which can be called to generate an error handling middleware for `expressjs`. It adds specific handling for `RequestError`s, which are accessible via a property of the exported function.

### RequestError

Class that inherits Error. Accessible via the `RequestError` property of the exported function. The constructor can be called with 2 parameters:

|Param|Type|Description|
|-----|----|-----------|
|`statusCode`|`string \| number`|The status code to be set for the response. This can be either `'404'` or `404` or `notFound`. Strings will be parsed and attempted to resolve. If unable to resolve, the status code will default to `500`. The status codes either use a parsed number (which may not be `NaN`, `-Infinity` or `Infinity`) or the resolved code, which can be looked up in the `statusCodes` property of the exposed function. This can also be expanded if necessary.|
|`body`|`string \| object`|The body to be set for the response. This can either be a string or an object. Depending on how this is planned throughout your application, make sure you set the `json` property of the middleware appropriately.|

### Middleware

The exposed function accepts one parameter called `config` which can contain the following properties:

|Param|Type|Description|
|-----|----|-----------|
|`logger`|`function`|Any function that is called with the error object. If not passed or not a function, it is silently ignored.|
|`json`|`boolean`|If the error contains the `body` property, it will be added to the body of the response. `true` will respond in JSON, `false` will respond with a string. **Default: `true`**|
|`catchAll`|`boolean`|Is this the only error middleware, should it catch all errors? Setting this to true will set the status to 500 for every error that is not a RequestError. **Default: `false`**|
|`endRequest`|`boolean`|Should the request be ended after this middleware? `true` will end the request after setting the status code. **Default: `true`**|
|`defaultFail`|`Mixed`|Any value to respond wiht by default if the error is not a request error, or does not have a body property in general. **Default: `{}` if `config.json === true`, `''` if `json.config === false`**|


## Sample

```javascript
const express = require('express');
const err = require('express-error-response');
const {RequestError} = err;

const config = {
    logger: function(err){
        console.log(err)
    },
    json: true,
    catchAll: false,
    endRequest: true
};

const middleware = err(config);

const server = express();

// Apply your routes and middlewares
server.use('/', function(req, res) {
    throw new RequestError('badRequest', {msg: 'Your request was invalid', info: 'some other info'});
});

// Register the error middleware
server.use(middleware);

server.listen(3000, '0.0.0.0');
```
