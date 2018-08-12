import { assert } from 'chai';
import { ChildProcess, fork, spawn } from 'child_process';
import { isEqual } from 'lodash';
import * as path from 'path';
import { first } from 'rxjs/operators';
import { ForkTransporter } from '../lib';

const childLocation = path.resolve(__dirname, 'tools');

describe('Fork Transporter', () => {

    let childProcess: ChildProcess;

    afterEach(() => {
        if (childProcess) {
            childProcess.kill();
        }
    });

    it('Child process able to listen on channel', (done) => {
        childProcess = fork(childLocation + '/child2');

        const transporter = new ForkTransporter(childProcess);

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
        childProcess = fork(childLocation + '/child3');

        const transporter = new ForkTransporter(childProcess);

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

    describe('Default Events', () => {

        it('exit', (done) => {
            childProcess = fork(childLocation + '/child5', [], {
                env: {
                    TEST: '1',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('exit')
                .pipe(first())
                .subscribe(() => {
                    done();
                });
        });

        it('close', (done) => {
            childProcess = fork(childLocation + '/child5', [], {
                env: {
                    TEST: '1',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('close')
                .pipe(first())
                .subscribe(() => {
                    done();
                });
        });

        it('disconnect', (done) => {
            childProcess = fork(childLocation + '/child5', [], {
                env: {
                    TEST: '2',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('disconnect')
                .pipe(first())
                .subscribe(() => {
                    done();
                });
        });

        it('error', (done) => {
            childProcess = fork(childLocation + '/child5');

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('error')
                .pipe(first())
                .subscribe(({ data }) => {
                    assert.ok(data.error, 'error does not exist in data');
                    done();
                });

            setTimeout(() => {
                childProcess.disconnect();
                childProcess.kill();
            }, 2000);
        });
    });
});
