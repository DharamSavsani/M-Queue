import { Priority } from "../enum/enum";

/**
 * Type definition for a process in the queue.
 */
export type Process = {
    /** 
     * The asynchronous function to be executed when the process is processed by the queue.
     */
    CallableFunction: () => Promise<any>;

    /** 
     * An optional unique identifier for the process. 
     * If not provided, it is auto-generated based on the queue length.
     */
    ProcessId?: string | number;
}

/**
 * Type definition for the return value of push and pop operations.
 */
export type PushPopReturnType = {
    /** The unique identifier of the process added to or removed from the queue. */
    ProcessId?: string | number;

    /** The updated length of the queue after the operation. */
    QueueLength: number;
}

/**
 * Type definition for the result of a process execution.
 */
export type Result = {
    /** The value returned by the executed process. */
    value: any;

    /** The unique identifier of the process that was executed. */
    processId: string | number;

    /** The updated length of the queue after the process execution. */
    queueLength: number;
}

/**
 * Type definition for options when adding a process to the queue.
 */
export type Options = {
    /** 
     * The priority of the process. 
     * Can be HIGH (1) or LOW (0). Defaults to LOW if not provided.
     */
    Priority?: number | Priority;

    /** 
     * An optional unique identifier for the process. 
     * If not provided, it is auto-generated based on the queue length.
     */
    ProcessId?: string | number;
}
