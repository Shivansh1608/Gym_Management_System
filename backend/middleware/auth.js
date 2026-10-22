const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    // Get token from header (support x-auth-token and standard Authorization Bearer header)
    let token = req.header('x-auth-token') || req.header('authorization') || req.header('Authorization');

    // Check token 
    if (!token) {
        return res.status(401).json({ status: 'fail', msg: 'No token, authorization denied', message: 'No token, authorization denied' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ status: 'fail', msg: 'Token is not valid', message: 'Token is not valid' });
    }
};

