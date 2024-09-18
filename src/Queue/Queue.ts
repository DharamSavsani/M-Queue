import { EventEmitter } from "stream";
import { Options, Process, PushPopReturnType } from "../types/type";
import { Priority, ProcessState } from "../enum/enum";


export class Queue extends EventEmitter {

    #Queue: Process[] = [];
    #isProcessStartFlag: boolean = false;
    #ProcessState: ProcessState = ProcessState.IDLE;
    CurrentProcessId: string | number | null = null;

    mqPush(Process: () => Promise<any>, Options?: Options): PushPopReturnType {
        const id: string | number = Options?.ProcessId !== undefined ? Options?.ProcessId : (this.#Queue.length + 1);
        if (Options?.Priority && Options?.Priority !== 0 && Options?.Priority !== 1) throw new Error('Priority must be HIGH(1) or LOW(0)');
        Options?.Priority === Priority.HIGH ? this.#Queue.unshift({ CallableFunction: Process, ProcessId: id }) : this.#Queue.push({ CallableFunction: Process, ProcessId: id });
        if (this.#isProcessStartFlag) this.#Worker();
        return { ProcessId: id, QueueLength: this.#Queue.length };
    }

    mqPop(): PushPopReturnType {
        if (this.#Queue.length === 0) throw new Error("Queue is empty: No processes available to execute.");
        if (this.CurrentProcessId === this.#Queue[this.#Queue.length - 1].ProcessId)
            throw new Error(`Process already under execution: The process with ID ${this.CurrentProcessId} is currently running.`);
        const processId = this.#Queue.pop()?.ProcessId;
        return { ProcessId: processId, QueueLength: this.#Queue.length };
    }

    mqRemove(ProcessId: string | number): PushPopReturnType {
        if (this.#Queue.length === 0) throw new Error("Queue is empty: No processes available to execute.");
        if (this.CurrentProcessId === ProcessId)
            throw new Error(`Process already under execution: The process with ID ${this.CurrentProcessId} is currently running.`);
        const processId = this.#Queue.splice(this.#Queue.findIndex((i) => i.ProcessId === ProcessId), 1)[0].ProcessId;
        return { ProcessId: processId, QueueLength: this.#Queue.length }
    }

    mqStart() {
        this.#isProcessStartFlag = true;
        this.#Worker();
    }

    getCurrentProcessId() {
        return this.CurrentProcessId;
    }

    getQueueLength(): number {
        return this.#Queue.length;
    }

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