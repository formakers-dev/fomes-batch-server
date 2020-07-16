const slack = require('../utils/slack');
const moment = require('moment');
const BeatTests = require('../models/betaTests');

const workingMessage = (channel) => {
  slack.sendMessage('배치 서버 동작 중 👍', channel);
};

const openedBetaTests = (channel) => {
  const currentTime = new Date();

  BeatTests.find({
      openDate: { $lte: currentTime },
      closeDate: { $gte: currentTime },
      $or: [
        { status: { $exists: false } },
        { status: { $ne: 'test' } }
      ],
    }).then(betaTests => {
      const titles = betaTests.map(betaTest => "- " + betaTest.title);
      const currentDate = moment().format('MM/DD');
      const message = "*[" + currentDate + "] 현재 포메스 앱에 오픈되어있는 테스트 입니다 : *\n" + titles.join('\n');

      slack.sendMessage(message, channel);
  }).catch(err => console.error(err));
};

module.exports = {
  workingMessage,
  openedBetaTests
};