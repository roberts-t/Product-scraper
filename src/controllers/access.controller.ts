import logger from '../helpers/logger.helper';
import AccessToken from '../models/access-token.model';
import { Types } from 'mongoose';
import RefreshToken from '../models/refresh-token.model';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAccess = async (req: any, res: any): Promise<void> => {
    const token = req.body?.token;
    if (!token) {
        logger.request(`${req.method} ${req.url}, ip: ${req.ip}, user-agent: ${req.headers['user-agent']}, success: false`);
        return res.status(400).json({ errorCode: 'INVALID_REQUEST' });
    }

    try {
        const availableAccessTokens = await AccessToken.find({});

        for (const availableAccessToken of availableAccessTokens) {
            const isMatch = await bcrypt.compare(token, availableAccessToken.token);
            logger.request(`${req.method} ${req.url}, ip: ${req.ip}, user-agent: ${req.headers['user-agent']}, success: ${isMatch}`);
            if (isMatch) {
                const jwt_token = jwt.sign(
                    {id: availableAccessToken._id},
                    process.env.SECRET_TOKEN,
                    { expiresIn: '10m' }
                );
                const refreshToken = jwt.sign(
                    {id: availableAccessToken._id},
                    process.env.REFRESH_TOKEN,
                );

                await updateRefreshToken(availableAccessToken._id, refreshToken);
                // Send httpOnly cookie with refresh token
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'PROD',
                });
                return res.status(200).json({ token: jwt_token });
            }
        }
        return res.status(400).json({ errorMsg: 'INCORRECT_TOKEN' });
    } catch (e) {
        logger.error(e);
        return res.sendStatus(500);
    }
}

const refreshAccess = async (req: any, res: any): Promise<void> => {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        logger.request(`${req.method} ${req.url}, ip: ${req.ip}, user-agent: ${req.headers['user-agent']}, success: false`);
        return res.status(400).json({ errorCode: 'INCORRECT_TOKEN' });
    }

    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        const refreshTokenDb = await RefreshToken.findOne({ accessBy: decoded.id });
        logger.request(`${req.method} ${req.url}, ip: ${req.ip}, user-agent: ${req.headers['user-agent']}, success: ${!!refreshTokenDb}`);
        if (!refreshTokenDb) {
            return res.status(400).json({ errorCode: 'INCORRECT_TOKEN' });
        }

        const accessToken = jwt.sign(
            {id: decoded.id},
            process.env.SECRET_TOKEN,
            { expiresIn: '10m' }
        );
        return res.status(200).json({ token: accessToken });
    } catch (e) {
        return res.status(400).json({ errorCode: 'INCORRECT_TOKEN' });
    }
}

const updateRefreshToken = async (accessId: Types.ObjectId, newRefreshToken: string): Promise<void> => {
    const existingRefreshToken = await RefreshToken.findOne({ accessBy: accessId });
    if (existingRefreshToken) {
        await RefreshToken.deleteOne({ accessBy: accessId });
    }
    const newRefreshTokenModel = new RefreshToken({
        token: newRefreshToken,
        accessBy: accessId
    });
    await newRefreshTokenModel.save();
}

const logout = async (req: any, res: any): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        logger.request(`${req.method} ${req.url}, ip: ${req.ip}, user-agent: ${req.headers['user-agent']}, success: false`);
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        await RefreshToken.deleteOne({ accessBy: decoded.id });
        res.clearCookie('refreshToken');
        logger.request(`${req.method} ${req.url}, ip: ${req.ip}, user-agent: ${req.headers['user-agent']}, success: true`);
        return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(500);
    }
}

module.exports = {
    getAccess,
    refreshAccess,
    logout
}
