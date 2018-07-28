import { assert, expect } from 'chai';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import { first } from 'rxjs/operators';
import { ForkTransporter, Transporter } from '../lib';

const childLocation = path.resolve(__dirname, 'tools');

describe('Transporter', () => {

    let process: ChildProcess;

    afterEach(() => {
        if (process) {
            process.kill();
        }
    });

    it('Properly send command', (done) => {
        process = fork(childLocation + '/child1');

        const transporter = new ForkTransporter(process);

        transporter.channel('TestCommand')
            .pipe(first())
            .subscribe(({ command }) => {
                assert.equal(command, 'TestCommand');
                done();
            });
    });

    it('Handle check when command is emitted on process with no parent', () => {
        expect(() => Transporter.emit('test')).to.not.throw();
    });

    it('Enable debug logging', () => {
        Transporter.enableLog = true;

        Transporter.emit('test');
    });
});
