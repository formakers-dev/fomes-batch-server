const shell = require('shelljs');

const tag = '[crawling]';

const runCrawlerForUncrawledApps = () => {
    console.log(tag, 'Execute shell commands to run crawler for UncrawledApps');

    const response = shell.exec('cd ${FOMES_CRAWLER_DIR_PATH} &&' +
        ' nohup scrapy crawl ${FOMES_UNCRAWLED_APP_SPIDER_NAME} > ${FOMES_CRAWLER_LOG_DIR_PATH}/$(date +%Y-%m-%d_%H:%M)_${FOMES_UNCRAWLED_APP_SPIDER_NAME}.log 2> ${FOMES_CRAWLER_LOG_DIR_PATH}/$(date +%Y-%m-%d_%H:%M)_${FOMES_UNCRAWLED_APP_SPIDER_NAME}.err &');

    checkResponse(response);
};

const checkResponse = (response) => {
    console.log(tag, response);

    if (response.code !== 0) {
        console.log(tag, '[error] previous command occur a error. so, this job is going to finish');
        console.error(response.stderr);

        // TODO : 논의필요. 배치는 무정지 서버로 유지해야하지 않을지?
        shell.exit(1);
    }
};

module.exports = {runCrawlerForUncrawledApps};