// implement verify middleware for jwt token
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // let token = req.headers.authorization;
    // token = token.split(' ')[1];
    let token = req.cookies.access_token;
    if (!token) return res.status(401).send('Access Denied');

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send('Invalid Token');
            }
            req.user = user;
            next();
        });
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}