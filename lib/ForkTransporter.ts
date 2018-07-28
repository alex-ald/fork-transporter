import { ChildProcess } from 'child_process';
import { Observable, Observer } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { Message } from './tools/Message';

/**
 * Creates wrapper around a child process for easy ipc communication
 *
 * @export
 * @class ChildTransporter
 */
export class ForkTransporter {

    private _channel: Observable<Message>;
    private process: ChildProcess;

    /**
     * Creates an instance of ChildTransporter.
     *
     * @memberof ChildTransporter
     */
    public constructor(process: ChildProcess) {
        this.process = process;

        this.setup();
    }

    /**
     * Creates a command channel filtering for a specific command
     *
     * @param {string} command
     * @returns
     * @memberof ChildTransporter
     */
    public channel(command: string) {
        return this._channel
            .pipe(filter((msg) => msg.command === command));
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
