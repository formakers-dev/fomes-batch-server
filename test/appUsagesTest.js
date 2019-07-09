const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const sinon = require('sinon');
const {removeOldUsages} = require('./../jobs/appUsages');

describe('AppUsages test', () => {
    const sandbox = sinon.createSandbox();

    beforeEach((done) => {
        const initialData = [
            {
                "packageName": "com.nhn.search",
                "userId": "userId1",
                "totalUsedTime": 1000.0,
                "date": new Date('2019-01-08 00:00:00.000Z')
            },
            {
                "packageName": "com.kakao.talk",
                "userId": "userId1",
                "totalUsedTime": 2000.0,
                "date": new Date('2019-01-07 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId2",
                "totalUsedTime": 1188,
                "date": new Date('2019-01-06 00:00:00.000Z')
            },
            {
                "packageName": "com.nhn.search",
                "userId": "userId3",
                "totalUsedTime": 1999,
                "date": new Date('2019-01-05 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId4",
                "totalUsedTime": 4000,
                "date": new Date('2019-01-04 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId5",
                "totalUsedTime": 5000,
                "date": new Date('2019-01-03 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId6",
                "totalUsedTime": 6000,
                "date": new Date('2019-01-02 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId7",
                "totalUsedTime": 7000,
                "date": new Date('2019-01-01 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId8",
                "totalUsedTime": 8000,
                "date": new Date('2018-12-31 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId9",
                "totalUsedTime": 9000
            },
        ];

        AppUsages.create(initialData)
            .then(() => done())
            .catch(err => done(err));
    });

    describe('removeOldUsages가 호출되면', function () {
        beforeEach(() => {
            sandbox.useFakeTimers(new Date("2019-01-31T00:00:00.000Z").getTime());
        });

        it('업데이트 날짜 정보가 없거나 오래된 앱사용정보를 삭제한다', (done) => {
            removeOldUsages()
                .then(() => AppUsages.find({}))
                .then(usages => {
                    usages.length.should.be.eql(8);

                    usages.sort((a, b) => b.date - a.date);

                    usages[0].packageName.should.be.eql("com.nhn.search");
                    usages[0].userId.should.be.eql("userId1");
                    usages[0].totalUsedTime.should.be.eql(1000.0);
                    usages[0].date.should.be.eql(new Date('2019-01-08 00:00:00.000Z'));
                    usages[1].packageName.should.be.eql("com.kakao.talk");
                    usages[1].userId.should.be.eql("userId1");
                    usages[1].totalUsedTime.should.be.eql(2000.0);
                    usages[1].date.should.be.eql(new Date('2019-01-07 00:00:00.000Z'));
                    usages[2].packageName.should.be.eql("com.google.maps");
                    usages[2].userId.should.be.eql("userId2");
                    usages[2].totalUsedTime.should.be.eql(1188);
                    usages[2].date.should.be.eql(new Date('2019-01-06 00:00:00.000Z'));
                    usages[3].packageName.should.be.eql("com.nhn.search");
                    usages[3].userId.should.be.eql("userId3");
                    usages[3].totalUsedTime.should.be.eql(1999);
                    usages[3].date.should.be.eql(new Date('2019-01-05 00:00:00.000Z'));
                    usages[4].packageName.should.be.eql("com.google.maps");
                    usages[4].userId.should.be.eql("userId4");
                    usages[4].totalUsedTime.should.be.eql(4000);
                    usages[4].date.should.be.eql(new Date('2019-01-04 00:00:00.000Z'));
                    usages[5].packageName.should.be.eql("com.google.maps");
                    usages[5].userId.should.be.eql("userId5");
                    usages[5].totalUsedTime.should.be.eql(5000);
                    usages[5].date.should.be.eql(new Date('2019-01-03 00:00:00.000Z'));
                    usages[6].packageName.should.be.eql("com.google.maps");
                    usages[6].userId.should.be.eql("userId6");
                    usages[6].totalUsedTime.should.be.eql(6000);
                    usages[6].date.should.be.eql(new Date('2019-01-02 00:00:00.000Z'));
                    usages[7].userId.should.be.eql("userId7");
                    usages[7].totalUsedTime.should.be.eql(7000);
                    usages[7].date.should.be.eql(new Date('2019-01-01 00:00:00.000Z'));
                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        })
    });

    afterEach((done) => {
        AppUsages.deleteMany({})
            .then(() => done())
            .catch(err => done(err));
    });
});

