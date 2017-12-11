const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const Apps = require('./../models/apps');
const UncrawledApps = require('../models/uncrawledApps');
const {insertUncrawledApps} = require('./../jobs/uncrawledApps');

require('../db').init();

describe('uncrawledApps Test', () => {

    beforeEach((done) => {
        const initialAppsData = [
            {
                packageName: 'com.package1.com'
            },
            {
                packageName: 'com.package2.com'
            },
            {
                packageName: 'com.package3.com'
            },
            {
                packageName: 'com.package4.com'
            },
            {
                packageName: 'com.package5.com'
            }
        ];

        const initialAppUsagesData = [
            {
                packageName: 'com.package2.com',
                userId: 'userId1',
                totalUsedTime: 1000.0
            },
            {
                packageName: 'com.package3.com',
                userId: 'userId1',
                totalUsedTime: 2000.0
            },
            {
                packageName: 'com.package6.com',
                userId: 'userId2',
                totalUsedTime: 1188
            },
            {
                packageName: 'com.package7.com',
                userId: 'userId2',
                totalUsedTime: 3000
            }
        ];

        AppUsages.create(initialAppUsagesData, () => {
            Apps.create(initialAppsData, done)
        });

    });


    it('getUncrawledApps가 호출되면 uncrawledApps가 조회된다', (done) => {
        insertUncrawledApps().then(() => {
            UncrawledApps.find({}).then(result => {
                result.length.should.be.eql(2);
                let expectedApps = ['com.package6.com', 'com.package7.com'];
                expectedApps.should.be.includes(result[0].packageName);
                expectedApps.should.be.includes(result[1].packageName);
                done();
            }).catch(err => done(err));

        }).catch(err => done(err));
    });

    afterEach((done) => {
        AppUsages.remove({}, () => {
            Apps.remove({}, () => {
                UncrawledApps.remove({}, done);
            });
        });
    });
});