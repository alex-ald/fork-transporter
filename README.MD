# fork-transporter
[![Build Status](https://travis-ci.com/alex-ald/fork-transporter.svg?branch=master)](https://travis-ci.com/alex-ald/fork-transporter)
[![Coverage Status](https://coveralls.io/repos/github/alex-ald/fork-transporter/badge.svg)](https://coveralls.io/github/alex-ald/fork-transporter)

## Overview

fork-transporter was created to provide an easier method for sending and receiving data between parent and child proceses in Nodejs. It is built using the [RxJS](https://github.com/ReactiveX/rxjs) framework to create an observer pattern around commands that are sent back and forth.

fork-transporter provides a wrapper class (`ForkTransporter`) around ChildProcess's `childProcess.send`/`childProcess.on` methods and also a wrapper class (`Transporter`) around global process object's `process.send`/`process.on` methods. 

## Install

NPM

```javascript
npm install fork-transporter
```

Yarn

```javascript
yarn add fork-transporter
```

## Example

This basic example shows the child process emitting a message to the parent process and the parent process listening for it. We can use RxJS operators, since the channel method returns an RxJS Observable, and manipulate the channel by only listening once `.pipe(first())`.

```typescript
////////////
// Parent.js
////////////


import { ForkTransporter } from 'fork-transporter';
import { fork } from 'child_process';
import { first } from 'rxjs/operators';

const child1 = fork('./Child.js');
const child1Transporter = new ForkTransporter(child1);

child1Transporter.channel('test-command')
    .pipe(first())
    .subscribe(({ command, data }) => {
        // Deconstruct the object to break out the command and data properties

        // Deconstruct data object 
        const { test1, test2 } = data;

        console.log('Test1: ' + test1);
        console.log('Test2: ' + test2);
    });


///////////
// Child.js
///////////

import { Transporter } from 'fork-transporter';

Transporter.emit('test-command', {
    test1: 'TESTING',
    test2: 'MORE TESTING'
});
```

## Api

fork-transporter exposes 2 classes - for parent and child processes

### Parent process api

```typescript
import { ForkTransporter } from 'fork-transporter';
```

#### Constructor

```typescript
const forkTransporter = new ForkTransporter(childProcess);
```

Instantiate a ForkTransporter class by passing in a child process that you want to create a transporter for.

### Emit

```typescript
forkTransporter.emit('command', {
    ...
})
```

Emits a message to the child process. First parameter is the command and the second is the data associated to the command (Data parameter is optional);

### Channel

```typescript
const commandChannel = forkTransporter.channel('command');
```

Channel method exposes an RxJS Observable which filters for the command specified. At this point, you can alter the Observable just like how you would normally.

```typescript
const channelSubscription = forkTransporter.channel('command')
    .subscribe(({ command, data }) => {
        ...
    });

channelSubscription.unsubscribe();
```

To add a callback on the command channel, simply call the subscribe method since it is an ordinary RxJS Observable. 

**NOTE:** Be sure to unsubscribe to all unwanted to subscriptions. Unneccessary subscriptions may cause memory leaks.

### Child process api

```typescript
import { Transporter } from 'fork-transporter';
```

### Emit

```typescript
Transporter.emit('command', {
    ...
})
```

Emits a message to the parent process. First parameter is the command and the second is the data associated to the command (Data parameter is optional);

### Channel

```typescript
const commandChannel = Transporter.channel('command');
```

Channel method exposes an RxJS Observable which filters for the command specified. At this point, you can alter the Observable just like how you would normally.

```typescript
const channelSubscription = Transporter.channel('command')
    .subscribe(({ command, data }) => {
        ...
    });

channelSubscription.unsubscribe();
```

To add a callback on the command channel, simply call the subscribe method since it is an ordinary RxJS Observable. 

**NOTE:** Be sure to unsubscribe to all unwanted to subscriptions. Unneccessary subscriptions may cause memory leaks.