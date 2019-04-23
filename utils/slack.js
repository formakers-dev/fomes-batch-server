const shell = require('shelljs');
const config = require('../config');
const log = require('./log');
const TAG = 'slack';

const sendMessage = (message, channel) => {
    log.info(TAG, `Send message "${message}" to "${channel}"`);

    const command = `curl -F text="${message}" -F channel="${channel}" -F token=${config.slackBotToken} https://slack.com/api/chat.postMessage`;
    const response = shell.exec(command);

    checkResponse(response);
};

const checkResponse = (response) => {
    log.info(`${TAG}.stdout`, response);

    if (response.code !== 0) {
        log.error(`${TAG}.stderr`, response.stderr);
    }
};

module.exports = {sendMessage};