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
    }).lean()
    .then(betaTests => {
      const betaTestsForTest = betaTests.filter(betaTest => betaTest.status === 'test');
      const betaTestsForRelease = betaTests.filter(betaTest => betaTest.status !== 'test');

      const currentDate = moment().format('MM/DD');
      let message = "*[" + currentDate + "] 포메스 앱 테스트 오픈 현황 공유*"
        + "\n\n*:fomes: 현재 포메스 앱에 오픈되어있는 테스트들 : *\n"
        + betaTestsForRelease.map(betaTest => "- " + betaTest.title).join('\n');

      if (betaTestsForTest.length > 0) {
        message += "\n\n*:white_check_mark: 테스트 모드로 오픈되어있는 테스트들 : *\n"
          + betaTestsForTest.map(betaTest => "- " + betaTest.title).join('\n');
      }

      slack.sendMessage(message, channel);
  }).catch(err => console.error(err));
};

module.exports = {
  workingMessage,
  openedBetaTests
};