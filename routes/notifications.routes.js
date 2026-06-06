import 'dotenv/config';
import express from 'express';
import db from '../db/index.js';
import { SendNotificationSchema } from '../validations/request.validations.js';
import { authenticationMiddleware } from '../middlewares/auth.middlewares.js';
import { notificationsTable } from '../models/notifications.models.js';
import { jobsTable } from '../models/job.models.js';
import { and, desc, eq } from 'drizzle-orm';

const router = express.Router();

router.post('/notifications', authenticationMiddleware, async (req, res) => {
    try {
        const validationResult = SendNotificationSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: validationResult.error.format(),
            });
        }

        const { channel, title, message } = validationResult.data;
        const userId = req.user.id;


        const result = await db.transaction(async (tx) => {
            const [notification] = await tx
                .insert(notificationsTable)
                .values({
                    userId,
                    channel,
                    title,
                    message,
                })
                .returning();

            const [job] = await tx
                .insert(jobsTable)
                .values({
                    notificationId: notification.id,
                })
                .returning();

            return { notification, job };
        });
        console.log({
            userId,
            channel,
            title,
            message,
        });

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            error: error.message,
        });

    }
});

router.get('/notifications', authenticationMiddleware, async (req, res) => {
    try {
        const notifications = await db
            .select()
            .from(notificationsTable)
            .where(
                eq(
                    notificationsTable.userId,
                    req.user.id
                )
            )
            .orderBy(desc(notificationsTable.createdAt));

        return res.status(200).json(notifications);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Failed to fetch notifications',
        });
    }
});

router.get('/:id', authenticationMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const [notification] = await db
            .select()
            .from(notificationsTable)
            .where(
                and(
                    eq(notificationsTable.id, id),
                    eq(notificationsTable.userId, req.user.id)
                )
            );
        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found',
            });
        }
        return res.status(200).json(notification);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Failed to fetch notification',
        });
    }
});

export default router;
