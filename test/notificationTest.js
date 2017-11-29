const chai = require('chai');
const should = chai.should();
const moxios = require('moxios');
const sinon = require('sinon');

const {sendNotification} = require('../jobs/notification');

describe('Notification test', () => {
    beforeEach(function () {
        moxios.install();
    });

    it('sendNotification 호출 시, FCM으로 대상자들에게 Notification메시지를 전송한다', (done) => {
        moxios.stubRequest('https://fcm.googleapis.com/fcm/send', {
            status: 200
        });

        let spyOnResponse = sinon.spy();
        const notificationIdList = ['token1', 'token2', 'token3'];
        const testProjectId = 'testProjectId';
        const testInterviewSeq = 1;
        const projectName = '툰스토리';
        const projectIntroduce = '문장을 쓰면 툰으로 변경해주는 인공지능 서비스';

        sendNotification(notificationIdList, testProjectId, testInterviewSeq, projectName, projectIntroduce)
            .then(spyOnResponse)
            .catch(err => done(err));

        moxios.wait(function () {
            const requestData = JSON.parse(spyOnResponse.getCall(0).args[0].config.data);
            requestData.registration_ids.length.should.be.eql(3);
            requestData.registration_ids[0].should.be.eql('token1');
            requestData.registration_ids[1].should.be.eql('token2');
            requestData.registration_ids[2].should.be.eql('token3');
            requestData.notification.title.should.be.eql('[툰스토리] 문장을 쓰면 툰으로 변경해주는 인공지능 서비스');
            requestData.data['EXTRA_PROJECT_ID'].should.be.eql('testProjectId');
            requestData.data['EXTRA_INTERVIEW_SEQ'].should.be.eql(1);
            done();
        })
    });

    afterEach(function () {
        moxios.uninstall();
    });

});

