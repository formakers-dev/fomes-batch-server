const axios = require('axios');
const config = require('../config');

const sendNotification = (registrationIds) => {
    if(!registrationIds || registrationIds.length <= 0) {
        return;
    }

    const key = config.firebaseMessaging.serverKey;
    const notification = {
        'title': '[AppBee] 앱비에서 새로운 테스트가 도착했어요',
        'body': '테스트를 한번 확인해 보세요.',
    };

    const data = JSON.stringify({
        'notification': notification,
        'registration_ids': registrationIds
    });

    return axios.post('https://fcm.googleapis.com/fcm/send', data, {
        headers: {
            'Authorization': 'key=' + key,
            'Content-Type': 'application/json'
        }
    });
};

module.exports = { sendNotification };