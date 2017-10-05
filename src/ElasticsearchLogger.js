module.exports = ElasticsearchLogger;

function ElasticsearchLogger(config) {
    const nolog = () => {
        // Do nothing...
    };
    const configLevel = config.logLevel ? config.logLevel : 'warning';
    console.log('ElasticsearchLogger using log level ', configLevel);
    this.trace   = include(configLevel, 'trace')   ? logTrace : nolog;
    this.debug   = include(configLevel, 'debug')   ? msg => log('DEBUG', msg)   : nolog;
    this.info    = include(configLevel, 'info')    ? msg => log('INFO', msg)    : nolog;
    this.warning = include(configLevel, 'warning') ? msg => log('WARNING', msg) : nolog;
    this.error   = include(configLevel, 'error')   ? msg => log('ERROR', msg)   : nolog;
}

const levels = [
    { name: 'trace',   value: 1 },
    { name: 'debug',   value: 2 },
    { name: 'info',    value: 3 },
    { name: 'warning', value: 4 },
    { name: 'error',   value: 5 }
];

function include(configLevel, candidateLevel) {
    const candidateLevelValue = levels.find(l => l.name === candidateLevel).value;
    const logLevelValue = levels.find(l => l.name === configLevel).value;
    return candidateLevelValue >= logLevelValue;
}

function logTrace (method, request, body, responseBody, responseStatus) {
    console.log('ElasticsearchLogger TRACE ',
        '\n method: ', method,
        '\n request: ', request,
        '\n responseBody: ', JSON.stringify(responseBody, null, '  '),
        '\n responseStatus: ', responseStatus);
}

function log(level, message) {
    console.log('ElasticsearchLogger', level, indent(message));
}

function indent(text) {
    return (text || '')
        .split(/\r?\n/)
        .map(line => ' ' + line)
        .join('\n');
}
