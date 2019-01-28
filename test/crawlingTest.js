const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const shell = require('shelljs');
const crawling = require('../jobs/crawling');

describe('Crawler Job Test', () => {
    describe('runCrawlerForUncrawledApps 호출 시', () => {
        it('환경변수를 이용해 쉘 커멘드를 입력한다', done => {
            const shellExecStub = sinon.stub(shell, 'exec');
            shellExecStub.callsFake(() => response = {code: 0});

            crawling.runCrawlerForUncrawledApps();

            const shellCommand = shellExecStub.getCall(0).args[0];

            shellCommand.should.be.eql('cd /test/crawler/root/dir/path/ && nohup scrapy crawl TestUncrawledAppSpiderName > /test/crawler/log/dir/path//$(date +%Y-%m-%d_%H:%M)_TestUncrawledAppSpiderName.log 2> /test/crawler/log/dir/path//$(date +%Y-%m-%d_%H:%M)_TestUncrawledAppSpiderName.err &');
            done();
        });
    });
});