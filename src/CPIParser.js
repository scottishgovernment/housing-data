'use strict';

/**
 * Parser for the CPI data from ONS.
 **/
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
                    var parsedDate = new Date(field);
                    var year = parsedDate.getFullYear();
                    var month = parsedDate.getMonth() + 1;

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

function convertReleaseDate(input) {
    // format used in the csv file for release date: 16-05-2017
    var match = input.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    return formatDate(match[3], match[2], match[1]);
}

function convertNextReleaseDate(input) {
    var date = new Date(input);
    return formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function formatDate(year, month, day) {
  function pad(number, width) {
      var string = number.toString();
      return '0'.repeat(width - string.length) + string;
  }
  return require('util').format('%s-%s-%s',
      pad(year, 4),
      pad(month, 2),
      pad(day, 2));
}

module.exports = CPIParser;
