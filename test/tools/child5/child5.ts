console.log('test process running...', 'Test: ' + process.env.TEST);

if (process.env.TEST === '1') {
    process.exit(0);
}

if (process.env.TEST === '2') {
    process.disconnect();
}
