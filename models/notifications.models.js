import { usersTable } from "./user.models.js";
import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const notificationChannelEnum = pgEnum("notification_channel", ["EMAIL", "PUSH", "SMS"]);
export const notificationStatusEnum = pgEnum("notification_status", ["PENDING", "PROCESSING", "SUCCESS", "FAILED"]);

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id), 
  channel: notificationChannelEnum("channel").notNull(),
  title: varchar("title", { length: 255 }).notNull(), 
  message: text("message").notNull(), 
  scheduledAt: timestamp("scheduled_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
