const axios = require('axios');
const config = require('../config');

const sendNotification = (registrationIds, projectId, interviewSeq, projectName, projectIntroduce) => {
    if (!registrationIds || registrationIds.length <= 0) {
        return;
    }

    const title = '[' + projectName + '] ' + projectIntroduce;
    const key = config.firebaseMessaging.serverKey;
    const notification = {
        'title': title,
        'body': '당신을 위한 유저 인터뷰를 확인해 보세요.'
    };

    const data = JSON.stringify({
        'notification': notification,
        'registration_ids': registrationIds,
        'data' : {
            'EXTRA_PROJECT_ID' : projectId,
            'EXTRA_INTERVIEW_SEQ': interviewSeq
        }
    });

    return axios.post('https://fcm.googleapis.com/fcm/send', data, {
        headers: {
            'Authorization': 'key=' + key,
            'Content-Type': 'application/json'
        }
    });
};

module.exports = {sendNotification};