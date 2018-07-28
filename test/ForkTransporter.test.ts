import { assert } from 'chai';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import { first } from 'rxjs/operators';
import { ChildTransporter } from '../lib';

const childLocation = path.resolve(__dirname, 'tools');

describe('Fork Transporter', () => {

    let process: ChildProcess;

    afterEach(() => {
        if (process) {
            process.kill();
        }
    });

    it('Properly send command', (done) => {
        process = fork(childLocation + '/child1/index.js');

        const transporter = new ChildTransporter(process);

        transporter.channel('TestCommand')
            .pipe(first())
            .subscribe(({ command }) => {
                assert.equal(command, 'TestCommand');
                done();
            });
    });
});
