const chai = require('chai');
const should = chai.should();
const AppUsages = require('./../models/appUsages');
const { getUserList } = require('./../jobs/appUsages');

require('../db').init();

describe('AppUsages test', () => {

    let data = [
        {
            "packageName" : "com.nhn.android.search",
            "userId" : "110897406327517511196",
            "totalUsedTime" : 1000.0
        },
        {
            "packageName" : "com.kakao.talk",
            "userId" : "110897406327517511196",
            "totalUsedTime" : 2000.0
        },
        {
            "packageName" : "com.google.android.apps.maps",
            "userId" : "109974316241227718963",
            "totalUsedTime" : 1188
        },
        {
            "packageName" : "com.nhn.android.search",
            "userId" : "109974316241227718999",
            "totalUsedTime" : 1999
        }
    ];

    beforeEach((done) => {
        AppUsages.create(data, done);
    });

    it('getUserList가 호출되면 특정 앱의 유저 리스트를 totalUsedTime 역순으로 정렬하여 반환한다', (done) => {
        let packageName = 'com.nhn.android.search';

        getUserList(packageName).then(result => {
            result.length.should.be.eql(2);
            result[0].packageName.should.be.eql('com.nhn.android.search');
            result[0].userId.should.be.eql('109974316241227718999');
            result[0].totalUsedTime.should.be.eql(1999);
            result[1].packageName.should.be.eql('com.nhn.android.search');
            result[1].userId.should.be.eql('110897406327517511196');
            result[1].totalUsedTime.should.be.eql(1000.0);
            done();
        }).catch(err => done(err));
    });

    afterEach((done) => {
        AppUsages.remove({}, done);
    });
});

