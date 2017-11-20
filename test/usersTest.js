const chai = require('chai');
const should = chai.should();
const Users = require('./../models/users');
const { getUserNotificationTokenList } = require('./../jobs/users');

require('../db').init();

describe('Users test', () => {

    let data = [
        {
            "userId": "userId1",
            "registrationToken": "token1",
        }, {
            "userId": "userId2",
            "registrationToken": "token2",
        }, {
            "userId": "userId3",
            "registrationToken": "token3",
        }, {
            "userId": "userId4",
            "registrationToken": "token4",
        },
    ];

    before((done) => {
        Users.remove({}, done);
    });

    beforeEach((done) => {
        Users.create(data, done);
    });

    it('getNotificationToken 가 호출되면 유저별 노티피케이션 토큰을 반환한다', (done) => {
        const appUsageList = [
            {
                "packageName": "com.kakao.talk",
                "userId": "userId1",
                "totalUsedTime": 1234
            }, {
                "packageName": "com.nhn.android.search",
                "userId": "userId2",
                "totalUsedTime": 4321
            }
        ];

        getUserNotificationTokenList(appUsageList).then(resultArray => {
            resultArray.length.should.be.eql(2);

            resultArray.sort(function(user1, user2) {
                return user1.userId.localeCompare(user2.userId);
            });

            resultArray[0].userId.should.be.eql('userId1');
            resultArray[0].registrationToken.should.be.eql('token1');
            resultArray[1].userId.should.be.eql('userId2');
            resultArray[1].registrationToken.should.be.eql('token2');
            done();
        }).catch(err => done(err));
    });

    afterEach((done) => {
        Users.remove({}, done);
    });
});

