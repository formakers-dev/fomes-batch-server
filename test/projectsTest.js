const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const Projects = require('./../models/projects');
const { getPackageNameList } = require('./../jobs/projects');

require('../db').init();

describe('Projects test', () => {

    let data = [{
            "projectId" : 100000042,
            "name" : "프로젝트",
            "introduce" : "한줄 소개",
            "description" : "입니다.",
            "status" : "registered",
            "interviewer" : {
                "introduce" : "안녕하세요",
                "url" : "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F62d78370-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=9764ce5e-d01d-4ffe-a846-0ad93ed89463",
                "name" : "진행자"
            },
            "customerId" : "google115838807161306170827",
            "descriptionImages" : [],
            "images" : [
                {
                    "name" : "5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df",
                    "url" : "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=0789dd42-cf2b-4995-b1f8-909cafcf82a9"
                }
            ],
            "__v" : 0,
            "interview" : {
                "plans" : [
                    {
                        "plan" : "준비",
                        "minute" : 10
                    },
                    {
                        "plan" : "테스트",
                        "minute" : 20
                    }
                ],
                "apps" : [
                    "com.nhn.android.search",
                    "com.kakao.talk"
                ],
                "endDate" : new Date("2017-11-04"),
                "startDate" : new Date("2017-11-03"),
                "closeDate" : new Date("2017-11-02"),
                "openDate" : new Date("2017-11-01"),
                "location" : "서울 잠실",
                "type" : "온라인 인터뷰"
            }
        },
        {
            "projectId" : 100000043,
            "name" : "프로젝트2",
            "introduce" : "한줄 소개",
            "description" : "입니다.",
            "status" : "registered",
            "interviewer" : {
                "introduce" : "안녕하세요",
                "url" : "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F62d78370-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=9764ce5e-d01d-4ffe-a846-0ad93ed89463",
                "name" : "진행자"
            },
            "customerId" : "google115838807161306170827",
            "descriptionImages" : [],
            "images" : [
                {
                    "name" : "5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df",
                    "url" : "https://firebasestorage.googleapis.com/v0/b/dragonserver-627cc.appspot.com/o/images%2F5e9dd160-c9c9-11e7-a70a-5b4fc8bee0df?alt=media&token=0789dd42-cf2b-4995-b1f8-909cafcf82a9"
                }
            ],
            "__v" : 0,
            "interview" : {
                "plans" : [
                    {
                        "plan" : "준비",
                        "minute" : 10
                    },
                    {
                        "plan" : "테스트",
                        "minute" : 20
                    }
                ],
                "apps" : [
                    "com.nhn.android.search"
                ],
                "endDate" : new Date("2017-11-04"),
                "startDate" : new Date("2017-11-02"),
                "closeDate" : new Date("2017-11-02"),
                "openDate" : new Date("2017-11-01"),
                "location" : "서울 잠실",
                "type" : "온라인 인터뷰"
            }
        }];

    beforeEach((done) => {
        Projects.create(data, done);
    });

    it('getPackageNameList가 호출되면 현재 모집중인 인터뷰에 대한 유사앱 packageNameList를 반환한다 ', (done) => {
        let clock = sinon.useFakeTimers(new Date("2017-11-02").getTime());

        getPackageNameList().then(result => {
            result.length.should.be.eql(1);
            result[0].projectId.should.be.eql(100000043);
            result[0].app.should.be.eql('com.nhn.android.search');
            done();
        }).catch(err => done(err));

        clock.restore();
    });

    afterEach((done) => {
        Projects.remove({}, done);
    });
});





