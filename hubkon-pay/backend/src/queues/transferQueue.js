// src/queues/transferQueue.js
/**
 * Transfer Queue
 * --------------------------
 * Simple in-memory queue for transfers.
 */

const queue = [];

/**
 * Add transfer to queue
 */
export function addToQueue(transfer) {
  queue.push(transfer);
}

/**
 * Get next transfer from queue
 */
export function getNext() {
  return queue.shift();
}