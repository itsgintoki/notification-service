import 'dotenv/config';
import express from 'express';
import db from '../db/index.js';
import { usersTable } from '../models/index.js';
import argon2 from 'argon2';
import { SignUpPostRequestSchema, LoginPostRequestSchema } from '../validations/request.validations.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const validationResult = await SignUpPostRequestSchema.safeParseAsync(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { name, email, password } = validationResult.data;

    try {
        const passwordHash = await argon2.hash(password);

        const [user] = await db.insert(usersTable).values({
            name,
            email,
            passwordHash,
        }).returning({ id: usersTable.id });

        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return res.status(201).json({ token });

    } catch (error) {
        const dbError = error.cause || error;

        if (dbError.code === '23505' || dbError.constraint === 'users_email_unique') {
            return res.status(409).json({ error: "Email already registered." });
        }

        console.error(error);
        return res.status(500).json({ error: "An error occurred during signup." });
    }
});

router.post('/login', async (req, res) => {
    const validationResult = await LoginPostRequestSchema.safeParseAsync(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { email, password } = validationResult.data;

    try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordMatch = await argon2.verify(user.passwordHash, password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return res.json({ token });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
});

export default router;