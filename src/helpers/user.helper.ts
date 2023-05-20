import { Request } from 'express';

const isLoggedIn = (req: Request): boolean => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return false;
    }
    try {
        const jwt = require('jsonwebtoken');
        return !!jwt.verify(token, process.env.SECRET_TOKEN);
    }
    catch (err) {
        return false;
    }
}

module.exports = {
    isLoggedIn
}