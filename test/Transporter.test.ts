import { assert, expect } from 'chai';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import { first } from 'rxjs/operators';
import { ForkTransporter, Transporter } from '../lib';

const childLocation = path.resolve(__dirname, 'tools');

describe('Transporter', () => {

    let childProcess: ChildProcess;

    afterEach(() => {
        if (childProcess) {
            childProcess.kill();
        }
    });

    it('Properly send command', (done) => {
        childProcess = fork(childLocation + '/child1');

        const transporter = new ForkTransporter(childProcess);

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

    describe('Default Events', () => {

        it('exit', (done) => {
            childProcess = fork(childLocation + '/child4', [], {
                env: {
                    TEST: '1',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('ran')
                .pipe(first())
                .subscribe(() => {
                    done();
                });
        });

        it('uncaughtException', (done) => {
            childProcess = fork(childLocation + '/child4', [], {
                env: {
                    TEST: '2',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('ran')
                .pipe(first())
                .subscribe(({ data }) => {
                    assert.ok(data.error, 'error does not exist in data');
                    done();
                });
        });

        it('warning', (done) => {
            childProcess = fork(childLocation + '/child4', [], {
                env: {
                    TEST: '3',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('ran')
                .pipe(first())
                .subscribe(({ data }) => {
                    assert.ok(data.warning, 'warning does not exist in data');
                    done();
                });
        });

        it('unhandledRejection', (done) => {
            childProcess = fork(childLocation + '/child4', [], {
                env: {
                    TEST: '4',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('ran')
                .pipe(first())
                .subscribe(({ data }) => {
                    assert.ok(data.reason, 'reason does not exist in data');
                    assert.ok(data.promise, 'promise does not exist in data');
                    done();
                });
        });

        it('rejectionHandled', (done) => {
            childProcess = fork(childLocation + '/child4', [], {
                env: {
                    TEST: '5',
                },
            });

            const transporter = new ForkTransporter(childProcess);

            transporter.channel('ran')
                .pipe(first())
                .subscribe(({ data }) => {
                    assert.ok(data.promise, 'promise does not exist in data');
                    done();
                });
        });
    });
});
