var HousingScheduler = require('../target/src/HousingScheduler.js');

// This is not a very good test.
describe('HousingScheduler', function() {

    it('schedules as expected', function () {

        // ARRANGE
        var scheduler = mockscheduler();
        const sut = new HousingScheduler(
                            {}, 'tab1',
                            {}, 'tab2',
                            scheduler);

        // ACT
        sut.schedule();

        // ASSERT
        expect(scheduler.tabs[0]).toBe('tab1');
        expect(scheduler.tabs[1]).toBe('tab2');
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
