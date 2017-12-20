const chai = require('chai');
const should = chai.should();
const moxios = require('moxios');
const sinon = require('sinon');

const {sendNotification} = require('../jobs/notification');

describe('Notification test', () => {
    beforeEach(function () {
        moxios.install();
    });

    it('인터뷰 모집 sendNotification 호출 시, FCM으로 대상자들에게 Notification메시지를 전송한다', (done) => {
        moxios.stubRequest('https://fcm.googleapis.com/fcm/send', {
            status: 200
        });

        let spyOnResponse = sinon.spy();
        const notificationIdList = ['token1', 'token2', 'token3'];
        const interviewInfo = {
            projectId: 'testProjectId',
            interviewSeq: 1,
            projectName: '툰스토리',
            projectIntroduce: '문장을 쓰면 툰으로 변경해주는 인공지능 서비스',
            notificationType: '모집',
        };

        sendNotification(notificationIdList, interviewInfo)
            .then(spyOnResponse)
            .catch(err => done(err));

        moxios.wait(function () {
            const requestData = JSON.parse(spyOnResponse.getCall(0).args[0].config.data);
            requestData.registration_ids.length.should.be.eql(3);
            requestData.registration_ids[0].should.be.eql('token1');
            requestData.registration_ids[1].should.be.eql('token2');
            requestData.registration_ids[2].should.be.eql('token3');
            requestData.notification.title.should.be.eql('[툰스토리] 문장을 쓰면 툰으로 변경해주는 인공지능 서비스');
            requestData.notification.body.should.be.eql('당신을 위한 유저 인터뷰를 확인해 보세요.');
            requestData.data['EXTRA_PROJECT_ID'].should.be.eql('testProjectId');
            requestData.data['EXTRA_INTERVIEW_SEQ'].should.be.eql(1);
            done();
        })
    });

    it('인터뷰 확정 sendNotification 호출 시, FCM으로 대상자들에게 Notification메시지를 전송한다', (done) => {
        moxios.stubRequest('https://fcm.googleapis.com/fcm/send', {
            status: 200
        });

        let spyOnResponse = sinon.spy();
        const notificationIdList = ['token1', 'token2', 'token3'];
        const interviewInfo = {
            projectId: 'testProjectId',
            interviewSeq: 1,
            projectName: '툰스토리',
            projectIntroduce: '문장을 쓰면 툰으로 변경해주는 인공지능 서비스',
            notificationType: '확정',
            interviewLocation: '서울대',
            interviewDate: new Date("2017-11-05T14:59:59.999Z"),
        };

        sendNotification(notificationIdList, interviewInfo)
            .then(spyOnResponse)
            .catch(err => done(err));

        moxios.wait(function () {
            const requestData = JSON.parse(spyOnResponse.getCall(0).args[0].config.data);
            requestData.registration_ids.length.should.be.eql(3);
            requestData.registration_ids[0].should.be.eql('token1');
            requestData.registration_ids[1].should.be.eql('token2');
            requestData.registration_ids[2].should.be.eql('token3');
            requestData.notification.title.should.be.eql('[툰스토리] 유저인터뷰 확정');
            requestData.notification.body.should.be.eql('신청하신 유저 인터뷰가 확정되었습니다! 확정된 인터뷰 정보를 다시 확인해주세요.\n' +
                '- 장소 : 서울대\n' +
                '- 날짜 : 2017.11.5 (일)\n' +
                '* 자세한 내용은 AppBee 앱의 \"다가오는 유저 인터뷰\"메뉴에서 확인해주세요.');
            requestData.data['EXTRA_PROJECT_ID'].should.be.eql('testProjectId');
            requestData.data['EXTRA_INTERVIEW_SEQ'].should.be.eql(1);
            done();
        })
    });

    afterEach(function () {
        moxios.uninstall();
    });

});

