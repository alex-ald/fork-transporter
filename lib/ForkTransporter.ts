import { ChildProcess } from 'child_process';
import { Observable, Observer } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { BaseTransporter } from './BaseTransporter';
import { ChildEvent } from './tools/Events';
import { Message } from './tools/Message';

/**
 * Creates wrapper around a child process for easy ipc communication
 *
 * @export
 * @class ForkTransporter
 */
export class ForkTransporter extends BaseTransporter {

    private _channel: Observable<Message>;
    private process: ChildProcess;

    /**
     * Creates an instance of ForkTransporter.
     *
     * @memberof ForkTransporter
     */
    public constructor(process: ChildProcess, logger?: any, allowLogging?: boolean) {
        super(logger, allowLogging);

        this.process = process;

        this.setup();
    }

    /**
     * Creates a command channel filtering for a specific command
     *
     * @param {string} command
     * @returns {Observable}
     * @memberof ForkTransporter
     */
    public channel(command: string) {
        return this._channel
            .pipe(filter((msg) => msg.command === command));
    }

    /**
     * Sends command with payload to child process
     *
     * @param {string} command
     * @param {*} data
     * @memberof ForkTransporter
     */
    public emit(command: string, data: any = {}) {
        this.process.send(this.createMessagePayload(command, data));
    }

    /**
     * Setup command channel
     *
     * @private
     * @memberof ForkTransporter
     */
    private setup() {
        // Create observable to receive all mesages from parent process
        this._channel = Observable.create((observer: Observer<Message>) => {
            // Listens for commands sent from child process
            this.process.on('message', (data) => {
                observer.next(data);
            });

            // Listens for 'close' events
            this.process.on('close', (code: number, signal: string) => {
                observer.next(this.createMessagePayload(ChildEvent.CLOSE, {
                    code,
                    signal,
                }));
            });

            // Listens for 'disconnect' events
            this.process.on('disconnect', () => {
                observer.next(this.createMessagePayload(ChildEvent.DISCONNECT));
            });

            // Listens for 'error' events
            this.process.on('error', (error: Error) => {
                observer.next(this.createMessagePayload(ChildEvent.ERROR, {
                    error,
                }));
            });

            // Listens for 'exit' events
            this.process.on('exit', (code: number, signal: string) => {
                observer.next(this.createMessagePayload(ChildEvent.EXIT, {
                    code,
                    signal,
                }));
            });
        });

        // Ensure observable is not recreated for each subscription
        this._channel = this._channel
            .pipe(share());
    }
}
