const jwt = require('jsonwebtoken');
const { errorHandler } = require('./error');

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) return next(errorHandler(500, 'token not available'));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(errorHandler(401, 'Unauthorized'));

        req.user = user;
        next();
    });


}

module.exports = { verifyToken }