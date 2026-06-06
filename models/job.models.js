import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { notificationsTable, notificationStatusEnum } from "./notifications.models.js";

export const jobsTable = pgTable('jobs', {
    id: uuid("id").primaryKey().defaultRandom(),
    notificationId: uuid("notification_id").notNull().references(() => notificationsTable.id, { onDelete: 'cascade' }).unique(),
    status: notificationStatusEnum("status").default("PENDING").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    availableAt: timestamp("available_at", { mode: 'date' }).defaultNow().notNull(),
    processingStartedAt: timestamp('processing_started_at', { mode: 'date' }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});