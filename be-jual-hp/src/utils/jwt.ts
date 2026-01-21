import jwt from 'jsonwebtoken';
import { TokenPayload, AuthTokens } from '../types/index.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_EXPIRES_SECONDS = 15 * 60; // 15 minutes
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const generateTokens = (payload: TokenPayload): AuthTokens => {
    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES_SECONDS,
    });

    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES_SECONDS,
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
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + REFRESH_EXPIRES_SECONDS);
    return expiry;
};
