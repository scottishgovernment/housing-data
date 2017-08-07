'use strict';

const execFile = require('child_process').execFile;

/**
 * Check if the service is running on the live leg or not.
 **/
class AmILiveCheck {

    check(callback) {
        execFile('/usr/local/bin/am-i-live', (error) => {
            if (error) {
                callback(error, false);
            } else {
                callback(undefined, true);
            }
        });
    }

}

module.exports = AmILiveCheck;
