'use strict';

module.exports =  function (dateSource) {

    // if no date source is sepcified then use system data timeParts
    // this enables tests to override the syustem date
    if (!dateSource) {
        dateSource = {
            date: () => new Date()
        };
    }

    return {
        dateString: function (d) {
            return [
                d.getUTCFullYear(),
                this.pad(2, '' + (d.getUTCMonth() + 1)),
                this.pad(2, '' + d.getUTCDate())
            ].join('-');
        },

        /**
         * compare a date string of the format 2012-12-30 wiuth the current date.
         **/
        compareWithNow: function (dateStr) {
            const now = dateSource.date();
            const nowDate = this.dateString(now);
            console.log('comparing ', nowDate, dateStr, nowDate.localeCompare(dateStr));
            return nowDate.localeCompare(dateStr);
        },

        pad: function (width, string) {
            return (width <= string.length) ? string : this.pad(width, '0' + string);
        }
    };
};
