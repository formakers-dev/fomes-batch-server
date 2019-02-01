const shell = require('shelljs');
const config = require('../config');

const tag = () => {
    return '[' + new Date().toISOString() + '][crawling]';
};

const getLogFilePath = (spiderName) => {
    return config.crawler.logDirPath + '/$(date +%Y-%m-%d_%H:%M)_' + spiderName + '.log'
};

const getErrorLogFilePath = (spiderName) => {
    return config.crawler.logDirPath + '/$(date +%Y-%m-%d_%H:%M)_' + spiderName + '.err'
};

const runCrawler = (spiderName, urls) => {
    console.log(tag(), 'Execute shell commands to run crawling for', spiderName);

    const argUrls = urls ? `-a urls="${urls}" ` : '';
    const response = shell.exec(`cd ${config.crawler.rootDirPath} && nohup scrapy crawl ${spiderName} ${argUrls}> ${getLogFilePath(spiderName)} 2> ${getErrorLogFilePath(spiderName)} &`);

    checkResponse(response);
};

const runCrawlerForUncrawledApps = () => {
    runCrawler(config.crawler.uncrawledApp.spiderName);
};

const runCrawlerForRankedApps = () => {
    runCrawler(config.crawler.rankedApp.spiderName, config.crawler.rankedApp.urls);
};

const checkResponse = (response) => {
    console.log(tag(), response);

    if (response.code !== 0) {
        console.log(tag(), '[error] previous command occur a error. so, this job is going to finish');
        console.error(response.stderr);

        // TODO : 논의필요. 배치는 무정지 서버로 유지해야하지 않을지?
        shell.exit(1);
    }
};

module.exports = {runCrawlerForUncrawledApps, runCrawlerForRankedApps};