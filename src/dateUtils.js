'use strict';

const moment = require('moment');

module.exports =  function (dateSource) {

    // if no date source is sepcified then use system data timeParts
    // this enables tests to override the syustem date
    if (!dateSource) {
        dateSource = {
            date: function () {
                var now = new Date();
                return now;
            }
        };
    }

    return {
        dateSource: dateSource,

        dateString: function (d) {
            return [
                d.getFullYear(),
                this.pad(2, '' + (d.getMonth() + 1)),
                this.pad(2, '' + d.getDate())
            ].join('-');
        },

        /**
         * compare a date string of the format 2012-12-30 with the current date.
         **/
        hasDatePassed: function (dateStr) {
            const now = dateSource.date();
            return moment(dateStr).isBefore(now);
        },

        pad: function (width, string) {
            return (width <= string.length) ? string : this.pad(width, '0' + string);
        }
    };
};
