import { startQueueEvents } from "./events/index.js";
import { startWorkers } from "./workers/index.js";

export function initializeBullMq() {
  const workers = startWorkers();
  const queueEvents = startQueueEvents();

  return {
    workers,
    queueEvents,
  };
}
