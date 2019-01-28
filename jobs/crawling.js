const shell = require('shelljs');
const config = require('../config');

const tag = () => {
    return '[' + new Date().toISOString() + '][crawler]';
};

const getLogFilePath = () => {
    return config.crawler.logDirPath + '/$(date +%Y-%m-%d_%H:%M)_' + config.crawler.uncrawledApp.spiderName + '.log'
};

const getErrorLogFilePath = () => {
    return config.crawler.logDirPath + '/$(date +%Y-%m-%d_%H:%M)_' + config.crawler.uncrawledApp.spiderName + '.err'
};

const runCrawlerForUncrawledApps = () => {
    console.log(tag(), 'Execute shell commands to run crawler for UncrawledApps');

    const response = shell.exec(`cd ${config.crawler.rootDirPath} && nohup scrapy crawl ${config.crawler.uncrawledApp.spiderName} > ${getLogFilePath()} 2> ${getErrorLogFilePath()} &`);

    checkResponse(response);
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

module.exports = {runCrawlerForUncrawledApps};