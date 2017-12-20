const chai = require('chai');
const should = chai.should();
const fs = require('fs');
const ShortTermStats = require('./../models/shortTermStats').shortTermStatsList;
const BackupShortTermStats = require('./../models/shortTermStats').backupShortTermStatsList;
const {renameCommnad, downloadCommand, dropCommand} = require('../jobs/backupShortTermStats');
const mongoose = require('mongoose');

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



    describe('sbort-term-stats를 backup-short-term-stats로 rename 한다.', () => {
        before(done => {
            ShortTermStats.create(data, done);
        });
        it('backup 호출시, short-term-stats를 backup-short-term-stats 으로 리네임한다.', (done) => {
            // short-term-stat
            renameCommnad();
            mongoose.connection.db.listCollections({name: 'backup-short-term-stats'})
                .next(function(err, collectionInfo) {
                    should.exist(collectionInfo);
                    done();
                });
        });
        after(done => {
            mongoose.connection.db.dropCollection('backup-short-term-stats', () => {
                done();
            });
        });
    });

    describe('backup 호출시, backup-short-term-stats를 백업하여 backupShortTermStats.json을 만든다.', () => {
        const path = process.env.BACKUP_OUTPUT_PATH + '/test/backup-short-term-stats.json';
        before(done => {
            BackupShortTermStats.create(data, done);
        });

        it('backup 호출시, backup-short-term-stats를 백업하여 backupShortTermStats.json을 만든다.', () => {
            downloadCommand(path);
            fs.existsSync(path).should.be.true;
        });
    });

    describe('backup 호출시, backup-short-term-stats이 삭제된다', () => {
        before(done => {
            BackupShortTermStats.create(data, done);
        });

        it('backup 호출시, backup-short-term-stats이 삭제된다', (done) => {
            // backup-short-term-stats
            dropCommand();
            mongoose.connection.db.listCollections({name: 'backup-short-term-stats'})
                .next(function(err, collectionInfo) {
                    should.not.exist(collectionInfo);
                    done();
                });
        });
    });
});

