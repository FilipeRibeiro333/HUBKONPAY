import { Worker } from "bullmq";
import { releaseEscrow } from "../services/escrowService.js";

/**
 * Worker for async escrow processing
 */
const worker = new Worker(
  "escrowQueue",
  async job => {
    if (job.name === "releaseEscrow") {
      await releaseEscrow(job.data.escrowId, job.data.user);
    }
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379
    }
  }
);

worker.on("completed", job => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});