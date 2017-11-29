const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const {getAppUsedUserList} = require('./../jobs/appUsages');

require('../db').init();

describe('AppUsages test', () => {
    beforeEach((done) => {
        const initialData = [
            {
                "packageName": "com.nhn.search",
                "userId": "userId1",
                "totalUsedTime": 1000.0
            },
            {
                "packageName": "com.kakao.talk",
                "userId": "userId1",
                "totalUsedTime": 2000.0
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId2",
                "totalUsedTime": 1188
            },
            {
                "packageName": "com.nhn.search",
                "userId": "userId3",
                "totalUsedTime": 1999
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId4",
                "totalUsedTime": 4000
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId5",
                "totalUsedTime": 5000
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId6",
                "totalUsedTime": 6000
            },
            {
                "packageName": "com.google.maps",
                "userId": "userId7",
                "totalUsedTime": 7000
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

    afterEach((done) => {
        AppUsages.remove({}, done);
    });
});

