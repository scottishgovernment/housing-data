var HousingScheduler = require('../src/HousingScheduler.js');

// This is not a very good test.
describe('HousingScheduler', function() {

    it('schedules as expected', function () {

        // ARRANGE
        var scheduler = mockscheduler();
        var updater = {
                isRunning : function () { return false },
                update: async function() { }
        };

        const sut = new HousingScheduler(updater, 'updatertab', scheduler);

        // ACT
        sut.schedule();
        scheduler.jobs.forEach(job => {
            job();
        });
    });

    it('schedules as expected, updater already running', function () {

        // ARRANGE
        var scheduler = mockscheduler();
        var updater = {
                isRunning : function () { return true },
                update: async function () { }
        };
        const sut = new HousingScheduler(updater, 'updatertab', scheduler);

        // ACT
        sut.schedule();
        scheduler.jobs.forEach(job => {
            job();
        });
    });

    function mockscheduler() {
        return {
            tabs: [],
            jobs: [],

            scheduleJob : function(tab, job) {
                this.tabs.push(tab);
                this.jobs.push(job);
            }
        }
    }

});
