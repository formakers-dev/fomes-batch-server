const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const Apps = require('./../models/apps');
const UncrawledApps = require('../models/uncrawledApps');
const {upsertUncrawledApps} = require('./../jobs/uncrawledApps');

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
                userId: 'userId1',
                totalUsedTime: 1234
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

    it('upsertUncrawledApps 호출 시 언크롤드 앱들이 UncrwaledApps 에 저장된다', (done) => {
        upsertUncrawledApps().then(() => {
            UncrawledApps.find({}).then(result => {
                result.length.should.be.eql(2);
                let expectedApps = ['com.package6.com', 'com.package7.com'];
                expectedApps.should.be.includes(result[0].packageName);
                expectedApps.should.be.includes(result[1].packageName);
                done();
            }).catch(err => done(err));

        }).catch(err => done(err));
    });

    describe('기존 데이터가 존재하는 경우', () => {
        beforeEach((done) => {
            UncrawledApps.create([{
                "packageName" : "com.package6.com"
            }], done);
        });

        it('upsertUncrawledApps 가 호출되면 기존 데이터를 제외한 언크롤드 앱들이 UncrwaledApps 에 저장된다', (done) => {
            UncrawledApps.find({}).then(result => {
                result.length.should.be.eql(1);
                result[0].packageName.should.be.eql('com.package6.com');
                return upsertUncrawledApps();
            }).then(() => {
                return UncrawledApps.find({})
            }).then(result => {
                result.length.should.be.eql(2);
                result[0].packageName.should.be.eql('com.package6.com');
                result[1].packageName.should.be.eql('com.package7.com');
                done();
            }).catch(err => done(err));
        });

        afterEach((done) => {
            UncrawledApps.remove({}, done);
        });
    });

    afterEach((done) => {
        AppUsages.remove({}, () => {
            Apps.remove({}, () => {
                UncrawledApps.remove({}, done);
            });
        });
    });
});