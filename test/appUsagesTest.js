const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const sinon = require('sinon');
const {getAppUsedUserList, removeOldUsages} = require('./../jobs/appUsages');

require('../db').init();

describe('AppUsages test', () => {
    const sandbox = sinon.createSandbox();

    beforeEach((done) => {
        const initialData = [
            {
                "packageName": "com.nhn.search",
                "userId": "userId1",
                "totalUsedTime": 1000.0,
                "updateTime": new Date('2019-01-30 00:00:00.000Z')
            },
            {
                "packageName": "com.kakao.talk",
                "userId": "userId1",
                "totalUsedTime": 2000.0,
                "updateTime": new Date('2019-01-29 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId2",
                "totalUsedTime": 1188,
                "updateTime": new Date('2019-01-28 00:00:00.000Z')
            },
            {
                "packageName": "com.nhn.search",
                "userId": "userId3",
                "totalUsedTime": 1999,
                "updateTime": new Date('2019-01-27 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId4",
                "totalUsedTime": 4000,
                "updateTime": new Date('2019-01-26 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId5",
                "totalUsedTime": 5000,
                "updateTime": new Date('2019-01-25 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId6",
                "totalUsedTime": 6000,
                "updateTime": new Date('2019-01-24 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId7",
                "totalUsedTime": 7000,
                "updateTime": new Date('2019-01-23 00:00:00.000Z')
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId8",
                "totalUsedTime": 8000
            },
        ];

        AppUsages.create(initialData, done);
    });

    it('getUserList가 호출되면 앱별 유저 리스트를 totalUsedTime 역순으로 정렬하여 반환한다', (done) => {
        const interviewInfo = {
            "projectId": 100000060,
            "interviewSeq": 1511134734116,
            "totalCount": 5,
            "apps": [{
                packageName: 'com.nhn.search',
                appName: '네이버검색'
            }, {
                packageName: 'com.kakao.talk',
                appName: '카카오톡'
            }]
        };

        getAppUsedUserList(interviewInfo).then(appUsedUserList => {
            appUsedUserList.length.should.be.eql(3);
            appUsedUserList[0].packageName.should.be.eql('com.kakao.talk');
            appUsedUserList[0].userId.should.be.eql('userId1');
            appUsedUserList[0].totalUsedTime.should.be.eql(2000.0);
            appUsedUserList[1].packageName.should.be.eql('com.nhn.search');
            appUsedUserList[1].userId.should.be.eql('userId3');
            appUsedUserList[1].totalUsedTime.should.be.eql(1999);
            appUsedUserList[2].packageName.should.be.eql('com.nhn.search');
            appUsedUserList[2].userId.should.be.eql('userId1');
            appUsedUserList[2].totalUsedTime.should.be.eql(1000.0);

            done();
        }).catch(err => done(err));
    });

    it('getUserList가 호출되면 사용시간역순으로 정렬된 사용자목록 중 최대 인터뷰 모집인원수만큼만 리턴한다', (done) => {
        const interviewInfo = {
            "projectId": 100000061,
            "interviewSeq": 123,
            "totalCount": 5,
            "apps": [{
                packageName: 'com.google.maps',
                appName: '구글맵'
            }]
        };

        getAppUsedUserList(interviewInfo).then(appUsedUserList => {
            appUsedUserList.length.should.be.eql(5);

            appUsedUserList[0].userId.should.be.eql('userId8');
            appUsedUserList[1].userId.should.be.eql('userId7');
            appUsedUserList[2].userId.should.be.eql('userId6');
            appUsedUserList[3].userId.should.be.eql('userId5');
            appUsedUserList[4].userId.should.be.eql('userId4');

            done();
        }).catch(err => done(err));
    });

    it('getUserList가 호출되면 기존에 Notification 받은 유저는 결과목록에서 제외한다', (done) => {
        const interviewInfo = {
            "projectId": 100000060,
            "interviewSeq": 124,
            "totalCount": 5,
            "apps": [{
                packageName: 'com.google.maps',
                appName: '구글맵'
            }],
            "notifiedUserIds": ['userId7']
        };

        getAppUsedUserList(interviewInfo).then(appUsedUserList => {
            appUsedUserList.length.should.be.eql(5);

            appUsedUserList[0].userId.should.be.eql('userId8');
            appUsedUserList[1].userId.should.be.eql('userId6');
            appUsedUserList[2].userId.should.be.eql('userId5');
            appUsedUserList[3].userId.should.be.eql('userId4');
            appUsedUserList[4].userId.should.be.eql('userId2');

            done();
        }).catch(err => done(err));
    });

    describe('removeOldUsages가 호출되면', function () {
        beforeEach(() => {
            sandbox.useFakeTimers(new Date("2019-01-30T00:00:00.000Z").getTime());
        });

        it('업데이트 날짜 정보가 없거나 오래된 앱사용정보를 삭제한다', (done) => {
            removeOldUsages()
                .then(() => AppUsages.find({}))
                .then(usages => {
                    usages.length.should.be.eql(7);

                    usages.sort((a, b) => b.updateTime - a.updateTime);

                    usages[0].packageName.should.be.eql("com.nhn.search");
                    usages[0].userId.should.be.eql("userId1");
                    usages[0].totalUsedTime.should.be.eql(1000.0);
                    usages[0].updateTime.should.be.eql(new Date('2019-01-30 00:00:00.000Z'));
                    usages[1].packageName.should.be.eql("com.kakao.talk");
                    usages[1].userId.should.be.eql("userId1");
                    usages[1].totalUsedTime.should.be.eql(2000.0);
                    usages[1].updateTime.should.be.eql(new Date('2019-01-29 00:00:00.000Z'));
                    usages[2].packageName.should.be.eql("com.google.maps");
                    usages[2].userId.should.be.eql("userId2");
                    usages[2].totalUsedTime.should.be.eql(1188);
                    usages[2].updateTime.should.be.eql(new Date('2019-01-28 00:00:00.000Z'));
                    usages[3].packageName.should.be.eql("com.nhn.search");
                    usages[3].userId.should.be.eql("userId3");
                    usages[3].totalUsedTime.should.be.eql(1999);
                    usages[3].updateTime.should.be.eql(new Date('2019-01-27 00:00:00.000Z'));
                    usages[4].packageName.should.be.eql("com.google.maps");
                    usages[4].userId.should.be.eql("userId4");
                    usages[4].totalUsedTime.should.be.eql(4000);
                    usages[4].updateTime.should.be.eql(new Date('2019-01-26 00:00:00.000Z'));
                    usages[5].packageName.should.be.eql("com.google.maps");
                    usages[5].userId.should.be.eql("userId5");
                    usages[5].totalUsedTime.should.be.eql(5000);
                    usages[5].updateTime.should.be.eql(new Date('2019-01-25 00:00:00.000Z'));
                    usages[6].packageName.should.be.eql("com.google.maps");
                    usages[6].userId.should.be.eql("userId6");
                    usages[6].totalUsedTime.should.be.eql(6000);
                    usages[6].updateTime.should.be.eql(new Date('2019-01-24 00:00:00.000Z'));
                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        })
    });

    afterEach((done) => {
        AppUsages.remove({}, done);
    });
});

