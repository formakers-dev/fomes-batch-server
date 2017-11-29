const chai = require('chai');
const should = chai.should();
const NotificationInterviews = require('./../models/notificationInterviews');
const {getAllNotificationInterviews, addNotificationInterview, removeNotificationInterview} = require('./../jobs/notificationInterviews');

require('../db').init();

describe('NotificationInterviews test', () => {
    beforeEach((done) => {
        const initialData = [
            {
                projectId: 1000001,
                interviewSeq: 1,
                projectName: '툰스토리',
                projectIntroduce: '문장을 쓰면 툰으로 변경해주는 인공지능 서비스',
                userIds: ['userId1','userId2','userId3']
            },
            {
                projectId: 1000001,
                interviewSeq: 2,
                projectName: '리얼포토',
                projectIntroduce: '사진을 찍으면 툰으로 변경해주는 인공지능 서비스',
                userIds: ['userId4','userId5']
            }
        ];

        NotificationInterviews.create(initialData, done);
    });

    it('getAllNotificationInterviews 호출 시 테이블에 저장된 모든 유저 목록을 리턴한다', (done) => {
        getAllNotificationInterviews().then(userIdArray => {

            const sortedUserIdArray = userIdArray.sort((a, b) => {
                return a.userIds[0].localeCompare(b.userIds[0]);
            });

            sortedUserIdArray.length.should.be.eql(2);
            sortedUserIdArray[0].projectId.should.be.eql(1000001);
            sortedUserIdArray[0].interviewSeq.should.be.eql(1);
            sortedUserIdArray[0].userIds.should.be.eql(['userId1','userId2','userId3']);

            sortedUserIdArray[1].projectId.should.be.eql(1000001);
            sortedUserIdArray[1].interviewSeq.should.be.eql(2);
            sortedUserIdArray[1].userIds.should.be.eql(['userId4','userId5']);

            done();
        }).catch(err => done(err));
    });

    it('addNotificationInterview 호출 시 입력한 인터뷰 목록을 저장한다', (done) => {
        const data = {
            projectId: 1000003,
            interviewSeq: 3,
            projectName: '앱비',
            projectIntroduce: '깁미더 리워드',
            userIds: ['userId21','userId22','userId23','userId24']
        };

        addNotificationInterview(data).then(() => {
            NotificationInterviews.find({}).exec().then((interviewArray) => {
                interviewArray.length.should.be.eql(3);
                interviewArray[2].projectId.should.be.eql(1000003);
                interviewArray[2].interviewSeq.should.be.eql(3);
                interviewArray[2].projectName.should.be.eql('앱비');
                interviewArray[2].projectIntroduce.should.be.eql('깁미더 리워드');
                interviewArray[2].userIds.length.should.be.eql(4);
                interviewArray[2].userIds.should.be.eql(['userId21','userId22','userId23','userId24']);
                done();
            }).catch(err => done(err));
        })
    });

    it('removeNotificationInterviews 호출 시 입력한 유저 목록을 삭제한다', (done) => {
        removeNotificationInterview({projectId: 1000001, interviewSeq: 2}).then(() => {
            NotificationInterviews.find({}).exec().then((interviewArray) => {
                interviewArray.length.should.be.eql(1);
                interviewArray[0].projectId.should.be.eql(1000001);
                interviewArray[0].interviewSeq.should.be.eql(1);
                interviewArray[0].userIds.should.be.eql(['userId1','userId2','userId3']);
                done();
            }).catch(err => done(err));
        })
    });

    afterEach((done) => {
        NotificationInterviews.remove({}, done);
    });
});
