'use strict';

module.exports =  {
    /**
     * compare a date string of the format 2012-12-30 wiuth the current date.
     **/
    compareWithNow: function (dateStr) {
        const now = new Date();
        const nowDate = [
            now.getUTCFullYear(),
            this.pad(2, now.getUTCMonth() + 1),
            this.pad(2, now.getUTCDate())
        ].join('-');
        return nowDate.localeCompare(dateStr);
    },

    pad: function (width, string) {
        return (width <= string.length) ? string : this.pad(width, '0' + string);
    }
};
