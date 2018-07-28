import { first } from 'rxjs/operators';
import { Transporter } from '../../../lib';

Transporter.channel('TestCmd2')
    .pipe(first())
    .subscribe(() => {
        Transporter.emit('FinalCmd', {
            testData: 'test',
        });
    });
