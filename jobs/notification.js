const axios = require('axios');
const config = require('../config');

const sendNotification = (notificationIdList, interviewInfo) => {

    const projectId = interviewInfo.projectId;
    const interviewSeq = interviewInfo.interviewSeq;
    const projectName = interviewInfo.projectName;
    const projectIntroduce = interviewInfo.projectIntroduce;
    const notiType = interviewInfo.notiType || '모집';

    if (!notificationIdList || notificationIdList.length <= 0) {
        return;
    }

    const key = config.firebaseMessaging.serverKey;
    const title = '[' + projectName + '] ' + projectIntroduce;
    let body = '';

    if (notiType === '모집') {
        body = '당신을 위한 유저 인터뷰를 확인해 보세요.';
    } else if (notiType === '확정') {
        let date = interviewInfo.interviewDate;

        body = '신청하신 유저 인터뷰가 확정되었습니다! 확정된 인터뷰 정보를 다시 확인해주세요.\n' +
            '- 장소 : ' + interviewInfo.interviewLocation + '\n' +
            '- 날짜 : ' + date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate() + ' (' + getDayString(date.getDay()) + ')\n' +
            '* 자세한 내용은 AppBee 앱의 \'다가오는 유저 인터뷰\'메뉴에서 확인해주세요.';
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error("Invalid notiType!!!"));
        });
    }

    const notification = {
        'title': title,
        'body': body
    };

    const data = JSON.stringify({
        'notification': notification,
        'registration_ids': notificationIdList,
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

const getDayString = (day) => {
  const dayString = ['일', '월', '화', '수', '목', '금', '토'];
  return dayString[day];
};

module.exports = {sendNotification};