const chai = require('chai');
const should = chai.should();
const fs = require('fs');
const ShortTermStats = require('./../models/shortTermStats');
const {getAllFromEndTime, writeBackupFile, removeShortTermStats} = require('./../jobs/shortTermStats');

require('../db').init();

describe('ShortTermStats test', () => {

    const data = [{
            "packageName": "com.whatever.package1",
            "startTimeStamp": 1499914700000,
            "endTimeStamp": 1499914800000,
            "totalUsedTime": 100000
        },
        {
            "packageName": "com.whatever.package2",
            "startTimeStamp": 1499914700001,
            "endTimeStamp": 1499914900001,
            "totalUsedTime": 200000
        },
        {
            "packageName": "com.whatever.package3",
            "startTimeStamp": 1499914700003,
            "endTimeStamp": 1499914900003,
            "totalUsedTime": 300000
        }];


    before((done) => {
        ShortTermStats.remove({}, done);
    });

    beforeEach((done) => {
        ShortTermStats.create(data, done);
    });

    it('getAllFromEndTime 호출시, 입력된 시간보다 endTimeStamp가 작은 경우만 조회한다', (done) => {
        getAllFromEndTime(1499914850000).then((stats) => {
            stats.length.should.be.eql(1);
            stats[0].packageName.should.be.eql('com.whatever.package1');
            stats[0].startTimeStamp.should.be.eql(1499914700000);
            stats[0].endTimeStamp.should.be.eql(1499914800000);
            stats[0].totalUsedTime.should.be.eql(100000);

            done();
        })
    });

    describe('writeBackupFile 호출시', () => {
        const filePath = './test-short-term-stats';

        beforeEach(() => {
            let backupData = JSON.stringify(data).toString();
            backupData = backupData.substring(1, backupData.length - 1);

            writeBackupFile(backupData, filePath);
        });

        it('받아온 데이터를 파일로 저장한다', () => {
            let readDataString = fs.readFileSync(filePath, 'utf8').toString();
            readDataString = readDataString.substring(0, readDataString.length - 1);

            const readData = JSON.parse("[" + readDataString + "]");

            readData.length.should.be.eql(3);
            readData[0].packageName.should.be.eql('com.whatever.package1');
            readData[1].packageName.should.be.eql('com.whatever.package2');
            readData[2].packageName.should.be.eql('com.whatever.package3');
        });

        afterEach((done) => {
            fs.unlink(filePath, done);
        });
    });

    it('removeShortTermStats 호출시, 받아온 ids에 해당하는 모든 데이터를 삭제한다', (done) => {
        ShortTermStats.find({}).then(result => {
            return result.map(data => data._id);
        }).then((ids) => {
            return removeShortTermStats(ids);
        }).then((result) => {
            result.result.n.should.be.eql(3);
            done();
        }).catch(err => done(err));
    });

    afterEach((done) => {
        ShortTermStats.remove({}, done);
    });
});

