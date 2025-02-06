const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Access Denied: No token provided' });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trim();
        }
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id).select('-password'); // Attach user to request
        req.user.token = token
        next(); // Proceed to the next middleware
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};


module.exports = auth;
