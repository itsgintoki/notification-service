import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable('users', {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar('first_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
