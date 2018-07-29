const Transporter = require('fork-transporter').Transporter;

Transporter.emit('test-command', {
    test1: 'TESTING',
    test2: 'MORE TESTING'
});