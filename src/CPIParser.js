'use strict';

/**
 * Parser for the CPI data from ONS.
 **/
const dateUtils = require('./dateUtils')();

class CPIParser {

    parse(inputStream, callback) {
        const csv = require('fast-csv');

        // pattern used to recognise the monthly figures.
        const monthlyPattern = /^\d{4} [A-Z]{3}$/;
        var cpiData = {
            type: 'cpi',
            cdid: undefined,
            datasetId: undefined,
            releaseDate: undefined,
            nextRelease: undefined,
            importTimestamp: new Date(),
            data: []
        };
        csv.fromStream(inputStream)
            .on('data', row => {
                const field = row[0];
                var value = row[1];
                if (monthlyPattern.test(field)) {
                    var timeParts = field.split(' ');
                    var year = parseInt(timeParts[0], 10);
                    var month = monthIndex(timeParts[1]);

                    cpiData.data.push({
                        year: year,
                        month: month,
                        value: parseFloat(row[1])
                    });
                    return;
                }

                switch (field) {
                    case 'Release date' :
                        cpiData.releaseDate = convertReleaseDate(value);
                    break;

                    case 'Next release' :
                        cpiData.nextRelease = convertNextReleaseDate(value);
                    break;

                    case 'CDID' :
                        cpiData.cdid = value;
                    break;

                    case 'Source dataset ID' :
                        cpiData.datasetId = value;
                    break;
                }
            })
            .on('end', () => {
                const validationErrors = validateCPIData(cpiData);
                if (validationErrors.length === 0) {
                    callback(undefined, cpiData);
                } else {
                    callback(validationErrors, undefined);
                }
            });
    }
}

function validateCPIData(cpi) {
    var validationErrors = [];
    const requiredFields = ['cdid', 'datasetId', 'releaseDate', 'nextRelease'];
    requiredFields.forEach(requiredField => {
        if (!cpi[requiredField]) {
            validationErrors.push('Missing required field:' + requiredField);
        }
    });

    if (cpi.data.length === 0) {
        validationErrors.push('No data');
    }
    return validationErrors;
}

function monthIndex(monthStr) {
    var monthNames = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    var index = monthNames.indexOf(monthStr);
    if (index === -1) {
        throw 'Unrecognised Month name: ' + monthStr;
    }

    // make the date 1 based
    return index + 1;
}

function convertReleaseDate(input) {
      // format used in the csv file for release date: 16-05-2017
      const format = 'dd/mm/yyyy';
      var parts = input.match(/(\d+)/g),  i = 0, fmt = {};
      // extract date-part indexes from the format
      format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++; });
      return [parts[fmt['yyyy']], parts[fmt['mm']], parts[fmt['dd']]].join('-');
}

function convertNextReleaseDate(input) {
      // format used in the csv file for next release date: 13 Jun 2017
      const parts = input.split(' ');
      const monthIndexRes = monthIndex(parts[1].toUpperCase());
      const newParts = [
        parts[2],
        dateUtils.pad(2, monthIndexRes),
        dateUtils.pad(2, parts[0])];
      return newParts.join('-');
}


module.exports = CPIParser;
