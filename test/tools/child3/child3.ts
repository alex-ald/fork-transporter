import { first } from 'rxjs/operators';
import { Transporter } from '../../../lib';

Transporter.channel('TestCmd2')
    .pipe(first())
    .subscribe(({ data }) => {
        Transporter.emit('FinalCmd', data);
    });
