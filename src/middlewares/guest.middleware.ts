import { Request, Response, NextFunction } from 'express';

module.exports = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
        return res.status(401).json({ errorMsg: 'GUEST_ONLY' });
    }
    next();
}