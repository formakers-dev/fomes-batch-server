const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const shell = require('shelljs');
const crawling = require('../jobs/crawling');

const sandbox = sinon.createSandbox();

describe('Crawler Job Test', () => {
    beforeEach(() => {
        sandbox.stub(shell, 'exec');
        shell.exec.callsFake(() => response = {code: 0});
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('runCrawlerForUncrawledApps 호출 시', () => {
        it('환경변수를 이용해 쉘 커멘드를 입력한다', done => {
            crawling.runCrawlerForUncrawledApps();

            const shellCommand = shell.exec.getCall(0).args[0];

            shellCommand.should.be.eql('cd /test/crawler/root/dir/path/ && nohup scrapy crawl TestUncrawledAppSpiderName > /test/crawler/log/dir/path//$(date +%Y-%m-%d_%H:%M)_TestUncrawledAppSpiderName.log 2> /test/crawler/log/dir/path//$(date +%Y-%m-%d_%H:%M)_TestUncrawledAppSpiderName.err &');
            done();
        });
    });

    describe('runCrawlerForRankedApps 호출 시', () => {
        it('환경변수를 이용해 쉘 커멘드를 입력한다', done => {
            crawling.runCrawlerForRankedApps();

            const shellCommand = shell.exec.getCall(0).args[0];

            shellCommand.should.be.eql('cd /test/crawler/root/dir/path/ && nohup scrapy crawl TestRankedAppSpiderName -a urls="test.ranking-urls.com" > /test/crawler/log/dir/path//$(date +%Y-%m-%d_%H:%M)_TestRankedAppSpiderName.log 2> /test/crawler/log/dir/path//$(date +%Y-%m-%d_%H:%M)_TestRankedAppSpiderName.err &');
            done();
        });
    });
});