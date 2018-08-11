import { Observable, Observer } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { BaseTransporter } from './BaseTransporter';
import { ParentEvent } from './tools/Events';
import { Message } from './tools/Message';

/**
 * Creates an wrapper around NodeJS.Process to allow easy communication to parent process
 *
 * @export
 * @class ForkTransporter
 */
export class Transporter extends BaseTransporter {

    private _channel: Observable<Message>;

    /**
     * Creates an instance of ForkTransporter.
     *
     * @memberof ForkTransporter
     */
    public constructor(logger?: any) {
        super(logger);

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
        this.log(`Creating command channel. [command: ${command}]`);
        return this._channel
            .pipe(filter((msg) => msg.command === command));
    }

    /**
     * Send command to parent process
     *
     * @param {string} command
     * @param {*} data
     * @memberof ForkTransporter
     */
    public emit(command: string, data: any = {}) {
        this.log(`Emitting command. [command: ${command}] [data: ${JSON.stringify(data)}]`);

        if (process.send) {
            process.send(this.createMessagePayload(command, data));
        } else {
            this.log('Could not emit command. There is no parent process');
        }
    }

    /**
     * Setup command channel
     *
     * @protected
     * @memberof ForkTransporter
     */
    protected setup() {
        // Create observable to receive all mesages from parent process
        this._channel = Observable.create((observer: Observer<Message>) => {
            process.on('message', (data) => {
                observer.next(data);
            });

            // Listens for 'beforeExit' events
            process.on('beforeExit', () => {
                observer.next(this.createMessagePayload(ParentEvent.BEFORE_EXIT));
            });

            // Listens for 'disconnect' events
            process.on('disconnect', () => {
                observer.next(this.createMessagePayload(ParentEvent.DISCONNECT));
            });

            // Listens for 'exit' events
            process.on('exit', (code: number) => {
                observer.next(this.createMessagePayload(ParentEvent.EXIT, { code }));
            });

            // Listens for 'warning' events
            process.on('warning', (warning: Error) => {
                observer.next(this.createMessagePayload(ParentEvent.WARNING, { warning }));
            });

            // Listens for 'rejectionHandled' events
            process.on('rejectionHandled', (promise: Promise<any>) => {
                observer.next(this.createMessagePayload(ParentEvent.REJECTION_HANDLED, { }));
            });

            // Listens for 'unhandledRejection' events
            process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
                observer.next(this.createMessagePayload(ParentEvent.UNHANDLED_REJECTION, { reason, promise }));
            });

            // Listens for 'uncaughtException' events
            process.on('uncaughtException', (error: Error) => {
                observer.next(this.createMessagePayload(ParentEvent.UNCAUGHT_EXCEPTION, { error }));
            });

        });

        // Ensure observable is not recreated for each subscription
        this._channel = this._channel
            .pipe(share());
    }
}
