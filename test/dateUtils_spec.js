
describe('datUtils', function() {

    it('Pads correctly', function () {
        var sut = require('../target/src/dateUtils.js')();
        expect(sut.pad(4, '4')).toBe('0004');
        expect(sut.pad(4, '4444')).toBe('4444');
        expect(sut.pad(2, '10')).toBe('10');
    });

    it('dateString formats dates as expected', function () {
        var sut = require('../target/src/dateUtils.js')();
        // months are 0 based, so should be formatted as 03
        var d1 = new Date(2010, 2, 1);
        expect(sut.dateString(d1)).toBe('2010-03-01');

        var d2 = new Date(2010, 2, 10);
        expect(sut.dateString(d2)).toBe('2010-03-10');
    });

    it('compare to now with system date source', function () {
        var sut = require('../target/src/dateUtils.js')();
        var millisInDay = 1000 * 60 * 60 * 24;
        var today = new Date();
        var yesterday = new Date(today.getTime() - millisInDay);
        var tomorrow = new Date(today.getTime() + millisInDay);
        expect(sut.compareWithNow(sut.dateString(yesterday))).toBe(1);
        expect(sut.compareWithNow(sut.dateString(today, sut))).toBe(0);
        expect(sut.compareWithNow(sut.dateString(tomorrow, sut))).toBe(-1);
    });

    it('compare with now within hour of midnight', function () {
        var sut = require('../target/src/dateUtils.js')();
        var millisInDay = 1000 * 60 * 60 * 24;
        var today = new Date();
        today.setHours(0);
        today.setMinutes(10);
        today.setSeconds(0);
        var yesterday = new Date(today.getTime() - millisInDay);
        var tomorrow = new Date(today.getTime() + millisInDay);
        expect(sut.compareWithNow(sut.dateString(yesterday))).toBe(1);
        expect(sut.compareWithNow(sut.dateString(today, sut))).toBe(0);
        expect(sut.compareWithNow(sut.dateString(tomorrow, sut))).toBe(-1);
    });


});
