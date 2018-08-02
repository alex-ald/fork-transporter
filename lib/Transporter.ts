import { Observable, Observer } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { BaseTransporter } from './BaseTransporter';
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
        });

        // Ensure observable is not recreated for each subscription
        this._channel = this._channel
            .pipe(share());
    }
}
