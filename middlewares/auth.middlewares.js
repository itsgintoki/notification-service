import jwt from 'jsonwebtoken';

export function authenticationMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: 'Authorization header required',
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
            error: 'Authorization header must start with Bearer',
        });
    }

    const [, token] = authHeader.split(' ');

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: payload.userId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token',
        });
    }
}