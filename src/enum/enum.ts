/**
 * Enum representing the state of the queue process.
 * 
 * @enum {number}
 */
export enum ProcessState {
    /** Indicates that a process is currently being executed. */
    UNDER_EXECUTION,
    
    /** Indicates that the queue is idle and no process is being executed. */
    IDLE
}

/**
 * Enum representing the priority of a process in the queue.
 * 
 * @enum {number}
 */
export enum Priority {
    /** High priority process. Tasks with HIGH priority are placed at the front of the queue. */
    HIGH = 1,

    /** Low priority process. Tasks with LOW priority are placed at the back of the queue. */
    LOW = 0,
}