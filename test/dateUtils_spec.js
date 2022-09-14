
describe('datUtils', function() {
    var sut = require('../src/dateUtils.js')();

    it('Pads correctly', function () {
        expect(sut.pad(4, '4')).toBe('0004');
        expect(sut.pad(4, '4444')).toBe('4444');
        expect(sut.pad(2, '10')).toBe('10');
    });

    it('dateString formats dates as expected', function () {
        // months are 0 based, so should be formatted as 03
        var d1 = new Date(2010, 2, 1);
        expect(sut.dateString(d1)).toBe('2010-03-01');

        var d2 = new Date(2010, 2, 10);
        expect(sut.dateString(d2)).toBe('2010-03-10');
    });

    it('has date passed system date source', function () {
        var millisInDay = 1000 * 60 * 60 * 24;
        var today = new Date();
        var yesterday = new Date(today.getTime() - millisInDay);
        var tomorrow = new Date(today.getTime() + millisInDay);
        expect(sut.hasDatePassed("2010-01-01")).toBe(true);
        expect(sut.hasDatePassed("2050-01-01")).toBe(false);
    });

});
