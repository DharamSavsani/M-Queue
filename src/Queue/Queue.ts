import { EventEmitter } from "stream";
import { Options, Process, PushPopReturnType } from "../types/type";
import { Priority, ProcessState } from "../enum/enum";


/**
 * Queue Class
 * 
 * A lightweight, efficient, and event-driven queue implementation for managing and executing asynchronous processes.
 * Built for Node.js environments, this class uses a FIFO (First-In-First-Out) mechanism with support for priority 
 * processing, dynamic addition/removal of tasks, and real-time event notifications.
 * 
 * Features:
 * - Push processes with priority handling (HIGH or LOW).
 * - Dynamically remove or pop processes from the queue.
 * - Start and stop the queue processing.
 * - Event-driven mechanism to retrieve process results.
 * 
 * Dependencies:
 * - Uses Node.js `EventEmitter` for event-based operations.
 * 
 * Usage:
 * ```javascript
 * import { Queue } from './queue';
 * 
 * const queue = new Queue();
 * 
 * // Push a process
 * queue.mqPush(async () => {
 *   // Some asynchronous operation
 * }, { ProcessId: 'task1', Priority: Priority.HIGH });
 * 
 * // Start the queue processing
 * queue.mqStart();
 * 
 * // Listen for results
 * queue.on('getResult', (result) => {
 *   console.log(result);
 * });
 * ```
 */
export class Queue extends EventEmitter {

    #Queue: Process[] = [];
    #isProcessStartFlag: boolean = false;
    #ProcessState: ProcessState = ProcessState.IDLE;
    CurrentProcessId: string | number | null = null;

    /**
    * Adds a new process to the queue with an optional priority.
    * If the queue is already processing, it starts processing the new process immediately.
    * 
    * @param {() => Promise<any>} Process - The asynchronous function to be executed.
    * @param {Options} [Options] - Additional options for the process:
    *   - ProcessId: A unique identifier for the process.
    *   - Priority: Priority of the process (HIGH (1) or LOW (0)).
    * 
    * @returns {PushPopReturnType} An object containing the ProcessId and the updated QueueLength.
    * 
    * @throws {Error} If an invalid priority is provided.
    */
    mqPush(Process: () => Promise<any>, Options?: Options): PushPopReturnType {
        const id: string | number = Options?.ProcessId !== undefined ? Options?.ProcessId : (this.#Queue.length + 1);
        if (Options?.Priority && Options?.Priority !== 0 && Options?.Priority !== 1) throw new Error('Priority must be HIGH(1) or LOW(0)');
        Options?.Priority === Priority.HIGH ? this.#Queue.unshift({ CallableFunction: Process, ProcessId: id }) : this.#Queue.push({ CallableFunction: Process, ProcessId: id });
        if (this.#isProcessStartFlag) this.#Worker();
        return { ProcessId: id, QueueLength: this.#Queue.length };
    }

    /**
     * Removes the last process from the queue.
     * 
     * @returns {PushPopReturnType} An object containing the ProcessId of the removed process and the updated QueueLength.
     * 
     * @throws {Error} If the queue is empty or if the last process is currently under execution.
     */
    mqPop(): PushPopReturnType {
        if (this.#Queue.length === 0) throw new Error("Queue is empty: No processes available to execute.");
        if (this.CurrentProcessId === this.#Queue[this.#Queue.length - 1].ProcessId)
            throw new Error(`Process already under execution: The process with ID ${this.CurrentProcessId} is currently running.`);
        const processId = this.#Queue.pop()?.ProcessId;
        return { ProcessId: processId, QueueLength: this.#Queue.length };
    }

    /**
     * Removes a specific process from the queue by its ProcessId.
     * 
     * @param {string | number} ProcessId - The unique identifier of the process to be removed.
     * 
     * @returns {PushPopReturnType} An object containing the ProcessId of the removed process and the updated QueueLength.
     * 
     * @throws {Error} If the queue is empty or if the specified process is currently under execution.
     */
    mqRemove(ProcessId: string | number): PushPopReturnType {
        if (this.#Queue.length === 0) throw new Error("Queue is empty: No processes available to execute.");
        if (this.CurrentProcessId === ProcessId)
            throw new Error(`Process already under execution: The process with ID ${this.CurrentProcessId} is currently running.`);
        const processId = this.#Queue.splice(this.#Queue.findIndex((i) => i.ProcessId === ProcessId), 1)[0].ProcessId;
        return { ProcessId: processId, QueueLength: this.#Queue.length }
    }

    /**
     * Starts processing the queue.
     * Processes are executed sequentially in the order they are added unless a higher priority is specified.
     */
    mqStart() {
        this.#isProcessStartFlag = true;
        this.#Worker();
    }

    /**
     * Stops processing the queue.
     * This does not clear the queue, and processes can resume when `mqStart()` is called again.
     */
    mqEnd() {
        this.#isProcessStartFlag = false;
    }

    /**
     * Retrieves the ProcessId of the process currently being executed.
     * 
     * @returns {string | number | null} The ProcessId of the current process, or null if no process is under execution.
     */
    getCurrentProcessId() {
        return this.CurrentProcessId;
    }

    /**
     * Gets the current length of the queue.
     * 
     * @returns {number} The number of processes currently in the queue.
     */
    getQueueLength(): number {
        return this.#Queue.length;
    }

    /**
     * Internal method to execute processes in the queue.
     * - Processes are executed sequentially.
     * - Emits the `getResult` event with the process result and queue details after execution.
     * 
     * @private
     * @async
     */
    async #Worker() {
        if (!this.#isProcessStartFlag
            || this.#Queue.length === 0
            || this.#ProcessState == ProcessState.UNDER_EXECUTION) return;
        this.#ProcessState = ProcessState.UNDER_EXECUTION;

        this.CurrentProcessId = this.#Queue[0].ProcessId || null;

        const ele = this.#Queue.shift();
        const res = await ele?.CallableFunction();
        const result = {
            value: res,
            processId: ele?.ProcessId,
            queueLength: this.#Queue.length,
        }
        this.emit('getResult', result);

        this.#ProcessState = ProcessState.IDLE;
        this.#Worker();
    }

}