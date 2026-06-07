import { jobsTable } from '../models/job.models.js';
import db from '../db/index.js';
import { eq, and, sql } from 'drizzle-orm';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWorker() {
    console.log("Worker initialized and listening for jobs...");

    while (true) {
        let job = null;

        try {
    
            const [fetchedJob] = await db.select()
                .from(jobsTable)
                .where(
                    and(
                        eq(jobsTable.status, "PENDING"),
                        sql`available_at <= NOW()`
                    )
                )
                .limit(1)
                .for('update', { skipLocked: true });

            job = fetchedJob;

            if (!job) {
                console.log("No pending jobs found. Sleeping...");
                await sleep(2000);
                continue;
            }

            console.log(`[Job ${job.id}] Claiming job...`);

            await db.update(jobsTable)
                .set({ status: "PROCESSING", processingStartedAt: new Date() })
                .where(eq(jobsTable.id, job.id));

            console.log(`[Job ${job.id}] Processing started...`);
            // throw new Error("SMTP timeout");

            await sleep(2000);

            await db.update(jobsTable)
                .set({ status: "SUCCESS" })
                .where(eq(jobsTable.id, job.id));

            console.log(`[Job ${job.id}] Completed successfully.`);

        } catch (error) {
            console.error("Worker encountered an execution error:", error.message);

            if (job) {
                try {
                    const nextAttempts = (job.attempts || 0) + 1; 
                    const MAX_RETRIES = 3;

                    if (nextAttempts >= MAX_RETRIES) {
                        console.log(`[Job ${job.id}] Max retries (${MAX_RETRIES}) reached. Marking job as FAILED.`);
                        await db.update(jobsTable)
                            .set({
                                status: "FAILED",
                                attempts: nextAttempts,
                                lastError: error.message, 
                            })
                            .where(eq(jobsTable.id, job.id));
                    } else {
                        console.log(`[Job ${job.id}] Attempt #${nextAttempts} failed. Retrying in 30 seconds...`);
                        await db.update(jobsTable)
                            .set({
                                status: "PENDING",
                                attempts: nextAttempts,
                                lastError: error.message,
                                availableAt: sql`NOW() + INTERVAL '30 seconds'`, 
                            })
                            .where(eq(jobsTable.id, job.id));
                    }
                } catch (dbUpdateError) {
                    console.error(`[Fatal] Failed to update job ${job.id} state in catch block:`, dbUpdateError.message);
                }
            }
            await sleep(5000);
        }
    }
}

startWorker();