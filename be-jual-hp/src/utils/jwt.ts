import jwt from 'jsonwebtoken';
import { TokenPayload, AuthTokens } from '../types/index.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateTokens = (payload: TokenPayload): AuthTokens => {
    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES,
    });

    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES,
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

export const getRefreshTokenExpiry = (): Date => {
    const days = parseInt(REFRESH_EXPIRES.replace('d', '')) || 7;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
};
