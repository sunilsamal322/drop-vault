import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { cleanupQueue } from "../bullmq/queues/cleanupQueue.js";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(cleanupQueue)],
  serverAdapter,
});

export { serverAdapter };
