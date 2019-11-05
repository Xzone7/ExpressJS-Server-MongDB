const jwt = require('jsonwebtoken');
const config = require('./config');

/* Middleware to get a token from request and proceeds only when the token is validated */
/* Work flow:
            1. Capature headers with names 'x-access-token' or 'authnorization'.
            2. If the header is in 'Authorization: Bearer xxxx...' format, strip unwanted prefix before token.   
            3. Using jwt package and secret string, validate the token.
            4. If anything goes wrong, return an error immediately before passing control to next handler.
            5. Export the middleware function for other modules to use.         
*/
let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    // pre-process
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                // adding a new property to req
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
}

module.exports = {
    checkToken: checkToken
}

console.log();
