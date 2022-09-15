'use strict';

const child_process = require('child_process');
const util = require('util');

/**
 * Check if the service is running on the live leg or not.
 **/
class AmILiveCheck {

    async check() {
        const execFile = util.promisify(child_process.execFile);
        execFile('/usr/local/bin/am-i-live')
        .then(() => {
            return true;
        })
        .catch(err => {
            if (err.code === 1) {
                return false;
            }
            throw err;
        });
    }

}

module.exports = AmILiveCheck;
