import { assert } from 'chai';
import { ChildProcess, fork } from 'child_process';
import { isEqual } from 'lodash';
import * as path from 'path';
import { first } from 'rxjs/operators';
import { ForkTransporter } from '../lib';

const childLocation = path.resolve(__dirname, 'tools');

describe('Fork Transporter', () => {

    let process: ChildProcess;

    afterEach(() => {
        if (process) {
            process.kill();
        }
    });

    it('Child process able to listen on channel', (done) => {
        process = fork(childLocation + '/child2');

        const transporter = new ForkTransporter(process);

        transporter.channel('FinalCmd')
            .pipe(first())
            .subscribe(({ command, data }) => {
                const { testData } = data;
                assert.equal(testData, 'test');
                assert.equal(command, 'FinalCmd');
                done();
            });

        transporter.emit('TestCmd2');
    });

    it('Ensure data safely arrived', (done) => {
        process = fork(childLocation + '/child3');

        const transporter = new ForkTransporter(process);

        const testData = {
            test1: 'test1',
            test2: 'test2',
        };

        transporter.channel('FinalCmd')
            .pipe(first())
            .subscribe(({ data }) => {
                assert.isTrue(isEqual(testData, data));
                done();
            });

        transporter.emit('TestCmd2', testData);
    });
});
