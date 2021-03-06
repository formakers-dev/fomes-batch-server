const shell = require('shelljs');
const config = require('../config');
const log = require('../utils/log');
const TAG = 'crawling';

const getLogFilePath = (spiderName) => {
    return config.crawler.logDirPath + '/$(date +%Y-%m-%d_%H:%M)_' + spiderName + '.log'
};

const getErrorLogFilePath = (spiderName) => {
    return config.crawler.logDirPath + '/$(date +%Y-%m-%d_%H:%M)_' + spiderName + '.err'
};

const runCrawler = (spiderName, urls) => {
    log.info(TAG, 'Execute shell commands to run crawling for', spiderName);

    const argUrls = urls ? `-a urls="${urls}" ` : '';
    const response = shell.exec(`cd ${config.crawler.rootDirPath} && nohup scrapy crawl ${spiderName} ${argUrls}> ${getLogFilePath(spiderName)} 2> ${getErrorLogFilePath(spiderName)} &`);

    checkResponse(response);
};

const runCrawlerForUncrawledApps = () => {
    runCrawler(config.crawler.uncrawledApp.spiderName);
};

const runCrawlerToUpdateAppInfo = () => {
    runCrawler(config.crawler.appInfoUpdate.spiderName);
};

const runCrawlerForRankedApps = () => {
    runCrawler(config.crawler.rankedApp.spiderName, config.crawler.rankedApp.urls);
};

const checkResponse = (response) => {
    log.info(TAG, '[shell.stdout]', response);

    if (response.code !== 0) {
        log.info(TAG, '[error] previous command occur a error. so, this job is going to finish');
        log.error(TAG, '[shell.stderr]', response.stderr);

        slack.sendMessage('π¨ [λ°°μΉ] ν¬λ‘€λ§ μ μ€λ₯ λ°μ!\nλ°°μΉκ° μ£Όκ²μ΄λ€--; κ°λ°ν μΆλνλΌ! πββπββοΈοΈ', 'dev-issues');
        shell.exit(1);
    }
};

module.exports = {
    runCrawlerForUncrawledApps,
    runCrawlerToUpdateAppInfo,
    runCrawlerForRankedApps,
};