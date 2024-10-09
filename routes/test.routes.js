const Admin = require('../models/admin.model');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; 

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }


    const bearerToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.adminId = decoded.f_userName; 
        req.adminMongoId = decoded.id; 
        next(); 
    });
};

module.exports = verifyToken;
