const slack = require('../utils/slack');

const workingMessage = (channel) => {
  slack.sendMessage('배치 서버 동작 중 👍', channel);
};


module.exports = {
  workingMessage,
};