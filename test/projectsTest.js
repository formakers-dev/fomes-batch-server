const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const Projects = require('./../models/projects');
const {getInterviewInfoListForNotification, addNotifiedUserIds} = require('./../jobs/projects');

require('../db').init();

describe('Projects test', () => {

    const data = [{
        "projectId": 100000042,
        "name": "프로젝트",
        "introduce": "한줄 소개",
        "description": "입니다.",
        "status": "registered",
        "interviewer": {
            "introduce": "안녕하세요",
            "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F62d78370-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=9764ce5e-d01d-4ffe-a846-0ad93ed89463",
            "name": "진행자"
        },
        "customerId": "google115838807161306170827",
        "descriptionImages": [],
        "images": [
            {
                "name": "5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df",
                "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=0789dd42-cf2b-4995-b1f8-909cafcf82a9"
            }
        ],
        "interviews": [
            {
                "seq": 1,
                "status": "registered",
                "plans": [
                    {
                        "plan": "준비",
                        "minute": 10
                    },
                    {
                        "plan": "테스트",
                        "minute": 20
                    }
                ],
                "apps": [
                    "com.nhn.android.search",
                    "com.kakao.talk"
                ],
                "endDate": new Date("2017-11-05T00:00:00.000Z"),
                "startDate": new Date("2017-11-04T00:00:00.000Z"),
                "closeDate": new Date("2017-11-02T00:00:00.000Z"),
                "openDate": new Date("2017-10-31T00:00:00.000Z"),
                "location": "서울 잠실",
                "type": "온라인 인터뷰",
                "totalCount": 5,
            },
            {
                "seq": 2,
                "status": "registered",
                "plans": [
                    {
                        "plan": "준비2",
                        "minute": 10
                    },
                    {
                        "plan": "테스트2",
                        "minute": 20
                    }
                ],
                "apps": [
                    "com.nhn.appbee.search",
                    "com.kakao.talk"
                ],
                "endDate": new Date("2017-11-05T00:00:00.000Z"),
                "startDate": new Date("2017-11-04T00:00:00.000Z"),
                "closeDate": new Date("2017-11-03T00:00:00.000Z"),
                "openDate": new Date("2017-11-02T00:00:00.000Z"),
                "location": "서울 잠실",
                "type": "온라인 인터뷰",
                "totalCount": 10,
            }
        ]
    },
        {
            "projectId": 100000043,
            "name": "프로젝트2",
            "introduce": "한줄 소개",
            "description": "입니다.",
            "status": "registered",
            "interviewer": {
                "introduce": "안녕하세요",
                "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F62d78370-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=9764ce5e-d01d-4ffe-a846-0ad93ed89463",
                "name": "진행자"
            },
            "customerId": "google115838807161306170827",
            "descriptionImages": [],
            "images": [
                {
                    "name": "5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df",
                    "url": "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=0789dd42-cf2b-4995-b1f8-909cafcf82a9"
                }
            ],
            "interviews": [{
                "seq": 1,
                "status": "registered",
                "plans": [
                    {
                        "plan": "준비",
                        "minute": 10
                    },
                    {
                        "plan": "테스트",
                        "minute": 20
                    }
                ],
                "apps": [
                    "com.nhn.android.search"
                ],
                "endDate": new Date("2017-11-04T00:00:00.000Z"),
                "startDate": new Date("2017-11-02T00:00:00.000Z"),
                "closeDate": new Date("2017-11-02T00:00:00.000Z"),
                "openDate": new Date("2017-11-01T00:00:00.000Z"),
                "location": "서울 잠실",
                "type": "온라인 인터뷰",
                "notifiedUserIds": ['userId1', 'userId2'],
                "totalCount": 15,
            }]
        }];

    beforeEach((done) => {
        Projects.create(data, done);
    });

    describe('getInterviewsForNotification', () => {
        let clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers(new Date("2017-11-02").getTime());
        });

        it('현재 모집중인 인터뷰에 대한 유사앱 packageNameList를 반환한다 ', (done) => {
            getInterviewInfoListForNotification().then(result => {
                result.length.should.be.eql(3);

                result.sort(function (result1, result2) {
                    const projectIdCompare = result1.projectId - result2.projectId;
                    return (projectIdCompare === 0) ? result1.interviewSeq - result2.interviewSeq : projectIdCompare;
                });

                result[0].projectId.should.be.eql(100000042);
                result[0].interviewSeq.should.be.eql(1);
                result[0].totalCount.should.be.eql(5);
                result[0].apps.length.should.be.eql(2);
                result[0].apps[0].should.be.eql('com.nhn.android.search');
                result[0].apps[1].should.be.eql('com.kakao.talk');
                result[0].should.not.hasOwnProperty('notifiedUserIds');

                result[1].projectId.should.be.eql(100000042);
                result[1].interviewSeq.should.be.eql(2);
                result[1].totalCount.should.be.eql(10);
                result[1].apps.length.should.be.eql(2);
                result[1].apps[0].should.be.eql('com.nhn.appbee.search');
                result[1].apps[1].should.be.eql('com.kakao.talk');
                result[1].should.not.hasOwnProperty('notifiedUserIds');

                result[2].projectId.should.be.eql(100000043);
                result[2].interviewSeq.should.be.eql(1);
                result[2].totalCount.should.be.eql(15);
                result[2].apps.length.should.be.eql(1);
                result[2].apps[0].should.be.eql('com.nhn.android.search');
                result[2].should.hasOwnProperty('notifiedUserIds');
                result[2].notifiedUserIds.length.should.be.eql(2);
                result[2].notifiedUserIds[0].should.be.eql('userId1');
                result[2].notifiedUserIds[1].should.be.eql('userId2');

                done();
            }).catch(err => done(err));
        });

        afterEach(() => {
            clock.restore();
        });
    });


    it('addNotifiedUserIds 가 호출되면 노티발송대상자들의 id정보를 해당 interview에 추가한다', (done) => {
        const interviewInfo = {
            'projectId': 100000043,
            'interviewSeq': 1,
            'userIds': ['userId3', 'userId4']
        };

        addNotifiedUserIds(interviewInfo).then(() => {
            Projects.aggregate([
                {$unwind: {path: '$interviews'}},
                {$match: {$and: [{projectId: interviewInfo.projectId}, {'interviews.seq': interviewInfo.interviewSeq}]}}
            ], (err, res) => {
                res[0].projectId.should.be.eql(interviewInfo.projectId);
                res[0].interviews.seq.should.be.eql(interviewInfo.interviewSeq);
                res[0].interviews.notifiedUserIds.length.should.be.eql(4);
                res[0].interviews.notifiedUserIds[0].should.be.eql('userId1');
                res[0].interviews.notifiedUserIds[1].should.be.eql('userId2');
                res[0].interviews.notifiedUserIds[2].should.be.eql('userId3');
                res[0].interviews.notifiedUserIds[3].should.be.eql('userId4');
                done();
            });
        }).catch(err => done(err));
    });

    afterEach((done) => {
        Projects.remove({}, done);
    });
});





