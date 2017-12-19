const chai = require('chai');
const should = chai.should();
const fs = require('fs');
const ShortTermStats = require('./../models/shortTermStats').shortTermStatsList;
const {backup} = require('../jobs/backupShortTermStats');
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

    beforeEach((done) => {
        ShortTermStats.create(data, done);
    });

    it('backup 호출시, short-term-stats를 backup-short-term-stats 으로 리네임한다.', (done) => {
        backup();
        mongoose.connection.db.listCollections({name: 'backup-short-term-stats'})
            .next(function(err, collinfo) {
                console.log(collinfo);
                should.exist(collinfo);
                mongoose.connection.db.listCollections({name: 'short-term-stats'})
                    .next(function(err, collectionInfo) {
                        console.log(collectionInfo);
                        should.not.exist(collectionInfo);
                        done();
                    });
            });
    });

    it('backup 호출시, short-term-stats를 백업하여 backupShortTermStats.json을 만든다.', (done) => {
        backup();

        const path = process.env.BACKUP_OUTPUT_PATH + 'backup-short-term-stats.json';
        fs.existsSync(path).should.be.true;
        // fs.readFile(path, 'utf8', function(err, data) {
        //     done();
        // });
    });

    it('backup 호출시, backup-short-term-stats이 삭제된다', (done) => {
        backup();
        mongoose.connection.db.listCollections({name: 'backup-short-term-stats'})
            .next(function(err, collectionInfo) {
                should.not.exist(collectionInfo);
                done();
            });
    });

    afterEach((done) => {
        ShortTermStats.remove({}, () => {
            mongoose.connection.db.listCollections({name: 'backup-short-term-stats'})
                .next(function(err, collectionInfo) {
                    if (collectionInfo) {
                        mongoose.connection.collections['backup-short-term-stats'].drop(err => done(err));
                    } else {
                        done();
                    }
                });
        });
    });
});

