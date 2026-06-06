import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { notificationsTable, notificationStatusEnum } from "./notifications.models.js";

export const jobsTable = pgTable('jobs', {
notificationId: uuid("notification_id").notNull().references(() => notificationsTable.id, {onDelete: 'cascade'}).unique(),  
  status: notificationStatusEnum("status").default("PENDING").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  available_at: timestamp("available_at", { mode: 'date' }).defaultNow().notNull(),
  processing_started_at: timestamp('processing_started_at', { mode: 'date' }),
  last_error: text("last_error"),
  created_at: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});