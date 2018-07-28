import { Observable } from 'rxjs';
import { Message } from './tools/Message';

export abstract class BaseTransporter {

    protected logger: any;
    protected allowLogging: boolean;

    constructor(logger?: any, allowLogging?: boolean) {
        this.logger = logger || console.log;
        this.allowLogging = allowLogging;

        this.log(`Setting up ${this.Name}...`);
    }

    public set enableLog(value: boolean) {
        this.allowLogging = value;
    }

    public abstract emit(command: string, data?: any): void;

    public abstract channel(command: string): Observable<Message>;

    protected log(msg: any) {
        if (this.allowLogging && this.logger) {
            this.logger(`${this.Name} : ${msg}`);
        }
    }

    protected get Name() {
        const comp = this.constructor;
        return comp.name;
    }
}
