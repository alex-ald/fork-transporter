const ForkTransporter = require('fork-transporter').ForkTransporter;
const fork = require('child_process').fork;
const path = require('path');
const first = require('rxjs/operators').first;


const child1 = fork(path.resolve(__dirname,'Child.js'));
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
