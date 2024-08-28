const jwt = require('jsonwebtoken');
var config = require('../config')
function verifyToken(req, res, next) {
    if (!req.headers.authorization)
        return req.status(401).send({ message: 'Token not provided' });
    // Validate bearer toekn
    if (req.headers.authorization.toLowerCase().indexOf("bearer ") != 0)
        return req.status(401).send({ message: 'Invalid Token' });
    // Get JWT token from Bearer one
    let token = req.headers.authorization.split(" ")[1];
    // verify jwt token
    jwt.verify(token, config.access_token_secret, function (err, decoded) {
        if (err) return res.status(400).send({ message: 'Unauthorized' });
        // if everything good, save to request for use in other routes
        req.current_user = decoded;
        next();
    })
}
module.exports = verifyToken