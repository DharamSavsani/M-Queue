# Queue System

A lightweight, simple queue system designed for small tasks that need to be executed in a queued manner. This system is **not a full-fledged message queue like BullMQ, RabbitMQ, or similar systems**, but it offers an efficient solution for handling tasks with minimal setup. It's ideal for projects where simplicity and low overhead are preferred.

This queue system works seamlessly with both JavaScript and TypeScript projects, providing type definitions for TypeScript while remaining fully compatible with JavaScript

This queue system is best suited for:

- **Small applications** that need to process tasks in sequence.
- **Microservices** where lightweight task handling is sufficient.
- **Jobs that require low overhead** and don’t need to interact with external systems like Redis or RabbitMQ.
- **Development and prototyping** where simplicity is key.


## Features

- **Push tasks**: Add new tasks to the queue.
- **Pop tasks**: Remove tasks from the queue.
- **Remove tasks**: Remove specific tasks from the queue.
- **Priority handling**: Support for high and low-priority tasks.
- **Asynchronous execution**: Tasks are executed asynchronously.
- **Current process tracking**: Track the process currently being executed.
- **Event-driven**: Emits events upon task completion with results.

## Installation

Install the package using npm:

```javascript
npm install mq-flow
```

To use this queue system, first import and initialize it

```javascript
import { Queue } from 'mq-flow';

const queue = new Queue();
```

You can push a task to the queue. Optionally, you can specify the task's priority and ID

```javascript
//To add new task to Queue
queue.mqPush(
() =>{
    return new Promise((resolve, reject) => {
        resolve('task-1');     
    })
}, { Priority: 1, ProcessId: 'task-1' });

queue.mqPush(
() =>{
    return new Promise((resolve, reject) => {
        resolve('task-2');     
    })
}, { Priority: 1, ProcessId: 'task-2' });
```

You can pop the last task added to the queue
```javascript
const popResult = queue.mqPop();
console.log(popResult);
```

To remove a specific task by its process ID

```javascript
const popResult = queue.mqRemove('task-1');
console.log(popResult);
```

To start processing the tasks in the queue:

```javascript
queue.mqStart();
```

You can retrieve the ID of the currently running process

```javascript
const currentProcessId = queue.getCurrentProcessId();
console.log(currentProcessId);
```

To check how many tasks are in the queue

```javascript
const queueLength = queue.getQueueLength();
console.log(queueLength);
```

You can listen for task results using the `getResult` event

```javascript
queue.on('getResult', (result) => {
    console.log('Task Result:', result);
});
```
### Types

You can define options and process types based on your requirements. The types used in the queue system are:

```Typescript
type Process = {
    CallableFunction: () => Promise<any>;
    ProcessId?: string | number;
}

type PushPopReturnType = {
    ProcessId?: string | number;
    QueueLength: number;
}

type Result = {
    value: any,
    processId: string | number,
    queueLength: number,
}

type Options = {
    Priority? : number | Priority, 
    ProcessId?: string | number,
}

```
### Enums

```javascript
export enum ProcessState {
    UNDER_EXECUTION,
    IDLE
};
```