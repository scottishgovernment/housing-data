'use strict';

module.exports =  function (dateSource) {

    // if no date source is sepcified then use system data timeParts
    // this enables tests to override the syustem date
    if (!dateSource) {
        dateSource = {
            date: function () {
                var now = new Date();

                now.setMinutes(0);
                now.setSeconds(0);
                now.setMilliseconds(0);
                return now;
            }
        };
    }

    return {
        dateString: function (d) {
            return [
                d.getFullYear(),
                this.pad(2, '' + (d.getMonth() + 1)),
                this.pad(2, '' + d.getDate())
            ].join('-');
        },

        /**
         * compare a date string of the format 2012-12-30 wiuth the current date.
         **/
        compareWithNow: function (dateStr) {
            const now = dateSource.date();
            const nowDate = this.dateString(now);
            console.log('compareWithNow');
            console.log('now:', now);
            console.log('nowDate:', nowDate);
            return nowDate.localeCompare(dateStr);
        },

        pad: function (width, string) {
            return (width <= string.length) ? string : this.pad(width, '0' + string);
        }
    };
};
