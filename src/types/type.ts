import { Priority } from "../enum/enum";

export type Process = {
    CallableFunction: () => Promise<any>;
    ProcessId?: string | number;
}

export type PushPopReturnType = {
    ProcessId?: string | number;
    QueueLength: number;
}

export type Result = {
    value: any,
    processId: string | number,
    queueLength: number,
}

export type Options = {
    Priority? : number | Priority, 
    ProcessId?: string | number,
}
