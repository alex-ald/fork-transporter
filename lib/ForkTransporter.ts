import { ChildProcess } from 'child_process';
import { Observable, Observer } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { BaseTransporter } from './BaseTransporter';
import { Message } from './tools/Message';

/**
 * Creates wrapper around a child process for easy ipc communication
 *
 * @export
 * @class ChildTransporter
 */
export class ForkTransporter extends BaseTransporter {

    private _channel: Observable<Message>;
    private process: ChildProcess;

    /**
     * Creates an instance of ChildTransporter.
     *
     * @memberof ChildTransporter
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
     * @memberof ChildTransporter
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
        this.process.send({
            command,
            data,
        });
    }

    /**
     * Setup command channel
     *
     * @private
     * @memberof ChildTransporter
     */
    private setup() {
        // Create observable to receive all mesages from parent process
        this._channel = Observable.create((observer: Observer<Message>) => {
            this.process.on('message', (data) => {
                observer.next(data);
            });
        });

        // Ensure observable is not recreated for each subscription
        this._channel = this._channel
            .pipe(share());
    }
}
