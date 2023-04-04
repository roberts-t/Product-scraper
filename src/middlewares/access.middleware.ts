import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

module.exports = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ errorMsg: 'AUTHORIZATION_REQUIRED' });
    }

    try {

        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        req.user = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ errorMsg: 'INVALID_TOKEN' });
    }
}