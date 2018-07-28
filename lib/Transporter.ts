import { Observable, Observer } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { Message } from './tools/Message';

/**
 * Creates an wrapper around NodeJS.Process to allow easy communication to parent process
 *
 * @export
 * @class ForkTransporter
 */
export class Transporter {

    private _channel: Observable<Message>;
    private logger: any;

    /**
     * Creates an instance of ForkTransporter.
     *
     * @memberof ForkTransporter
     */
    public constructor(logger?: any) {
        this.logger = logger;

        this.log('Setting up ForkTransporter...');
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
     * Send command to parent process
     *
     * @param {string} command
     * @param {*} data
     * @memberof ForkTransporter
     */
    public emit(command: string, data?: any) {
        if (process.send) {
            process.send({
                command,
                data,
            });
        }
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
            process.on('message', (data) => {
                observer.next(data);
            });
        });

        // Ensure observable is not recreated for each subscription
        this._channel = this._channel
            .pipe(share());
    }

    private log(msg: any) {
        if (this.logger) {
            this.logger(msg);
        }
    }
}
