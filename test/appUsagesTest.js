const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const {getAppUsedUserList} = require('./../jobs/appUsages');

require('../db').init();

describe('AppUsages test', () => {
    beforeEach((done) => {
        const initialData = [
            {
                "packageName": "com.nhn.android.search",
                "userId": "110897406327517511196",
                "totalUsedTime": 1000.0
            },
            {
                "packageName": "com.kakao.talk",
                "userId": "110897406327517511196",
                "totalUsedTime": 2000.0
            },
            {
                "packageName": "com.google.android.apps.maps",
                "userId": "109974316241227718963",
                "totalUsedTime": 1188
            },
            {
                "packageName": "com.nhn.android.search",
                "userId": "109974316241227718999",
                "totalUsedTime": 1999
            }
        ];

        AppUsages.create(initialData, done);
    });

    it('getUserList가 호출되면 앱별 유저 리스트를 totalUsedTime 역순으로 정렬하여 반환한다', (done) => {
        const interviewInfo = {
            "projectId": 100000060,
            "interviewSeq": 1511134734116,
            "apps": ['com.nhn.android.search', 'com.kakao.talk']
        };

        getAppUsedUserList(interviewInfo).then(result => {
            result.length.should.be.eql(3);
            result[0].packageName.should.be.eql('com.kakao.talk');
            result[0].userId.should.be.eql('110897406327517511196');
            result[0].totalUsedTime.should.be.eql(2000.0);
            result[1].packageName.should.be.eql('com.nhn.android.search');
            result[1].userId.should.be.eql('109974316241227718999');
            result[1].totalUsedTime.should.be.eql(1999);
            result[2].packageName.should.be.eql('com.nhn.android.search');
            result[2].userId.should.be.eql('110897406327517511196');
            result[2].totalUsedTime.should.be.eql(1000.0);

            done();
        }).catch(err => done(err));
    });

    it('getUserList가 호출되면 기존에 Notification 받은 유저는 결과목록에서 제외한다', (done) => {
        const interviewInfo = {
            "projectId": 100000060,
            "interviewSeq": 1511134734116,
            "apps": ['com.nhn.android.search', 'com.kakao.talk'],
            "notifiedUserIds": ['110897406327517511196']
        };

        getAppUsedUserList(interviewInfo).then(result => {
            result.length.should.be.eql(1);
            result[0].packageName.should.be.eql('com.nhn.android.search');
            result[0].userId.should.be.eql('109974316241227718999');
            result[0].totalUsedTime.should.be.eql(1999);

            done();
        }).catch(err => done(err));
    });

    afterEach((done) => {
        AppUsages.remove({}, done);
    });
});

