import { startCleanupQueueEvents } from "./cleanupQueueEvents.js";

export function startQueueEvents() {
  const cleanupQueueEvents = startCleanupQueueEvents();

  return [cleanupQueueEvents];
}
