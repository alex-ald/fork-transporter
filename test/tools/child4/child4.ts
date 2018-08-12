import { first } from 'rxjs/operators';
import { Transporter } from '../../../lib';

console.log('test process running...', 'Test: ' + process.env.TEST);

if (process.env.TEST === '1') {
    Transporter.channel('exit')
    .pipe(first())
    .subscribe(({ data }) => {
        console.log('exit received...');
        Transporter.emit('ran', data);
    });

    process.exit(0);
}

if (process.env.TEST === '2') {
    Transporter.channel('uncaughtException')
    .pipe(first())
    .subscribe(({ data }) => {
        console.log('uncaughtException received...');
        console.log('data: ', JSON.stringify(data));

        Transporter.emit('ran', data);
    });

    throw new Error('Test 2 error');
}

if (process.env.TEST === '3') {
    Transporter.channel('warning')
    .pipe(first())
    .subscribe(({ data }) => {
        console.log('warning received...');
        console.log('data: ', JSON.stringify(data));

        Transporter.emit('ran', data);
    });

    process.emitWarning('Test 3 warning');
}

if (process.env.TEST === '4') {
    Transporter.channel('unhandledRejection')
    .pipe(first())
    .subscribe(({ data }) => {
        console.log('unhandledRejection received...');
        console.log('data: ', JSON.stringify(data));
        Transporter.emit('ran', data);
    });

    const testPromise = new Promise((resolve, reject) => {
        throw new Error('Test 4 error');
    });
}

if (process.env.TEST === '5') {
    Transporter.channel('rejectionHandled')
    .pipe(first())
    .subscribe(({ data }) => {
        console.log('rejectionHandled received...');
        console.log('data: ', JSON.stringify(data));
        Transporter.emit('ran', data);
    });

    Transporter.channel('unhandledRejection')
    .pipe(first())
    .subscribe(({ data }) => {
        console.log('unhandledRejection received...');

        data.promise
            .catch((err) => {
                console.log('error: ', err);
            });
    });

    const testPromise = new Promise((resolve, reject) => {
        reject('Test rejection.');
    });
}

if (process.env.TEST === '6') {
    Transporter.channel('beforeExit')
        .pipe(first())
        .subscribe(({ data }) => {
            console.log('beforeExit received...');
            Transporter.emit('ran', data);
        });

    process.on('beforeExit', () => {
        console.log('IN EVENT EMITTER');
    });
}
