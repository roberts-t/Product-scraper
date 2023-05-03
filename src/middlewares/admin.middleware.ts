import { Request, Response, NextFunction } from 'express';
import AccessTokenModel from '../models/access-token.model';
const jwt = require('jsonwebtoken');

module.exports = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ errorMsg: 'AUTHORIZATION_REQUIRED' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        const userId = decoded.id;
        const isAdmin = await AccessTokenModel.findOne({ userId: userId, isAdmin: true });
        if (!isAdmin) {
            return res.status(401).json({ errorMsg: 'RESTRICTED' });
        } else {
            next();
        }
    } catch (err) {
        res.status(401).json({ errorMsg: 'INVALID_TOKEN' });
    }
}