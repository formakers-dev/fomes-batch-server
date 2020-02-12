const chai = require('chai');
const should = chai.should();
const config = require('../config');
const mongoose = require('mongoose');
const Apps = require('../models/apps');
const BetaTests = require('../models/betaTests');
const {syncDataToStg, syncAppsDataToStg} = require('../jobs/syncDB');


const stgDbConnection = mongoose.createConnection(config.fomesStgDbUrl, {useNewUrlParser: true});
const stgApps = stgDbConnection.model('apps', Apps.schema);
const stgBetaTests = stgDbConnection.model('beta-tests', BetaTests.schema);

describe('syncDB Test', () => {
    const appsData = [{
        packageName: "dummy.package.1"
    }, {
        packageName: "dummy.package.2"
    }, {
        packageName: "dummy.package.3"
    }, {
        packageName: "can.not.synced.package.1"
    }, {
        packageName: "can.not.synced.package.2"
    }, {
        packageName: "can.not.synced.package.3"
    }];

    const betaTestsData = [{
        title: "dummy.title.1",
        missions: [{
            items: [{
                packageName: "dummy.package.1"
            }]
        }]
    }, {
        title: "dummy.title.2",
        missions: [{
            items: [{
                packageName: "dummy.package.2"
            }]
        }]
    }, {
        title: "dummy.title.3",
        missions: [{
            items: [{
                packageName: "dummy.package.3"
            }]
        }]
    }];

    const stgAppsData = [{
        packageName: "dummy.package.4"
    }, {
        packageName: "dummy.package.5"
    }, {
        packageName: "dummy.package.6"
    }];

    const stgBetaTestsData = [{
        title: "dummy.title.4",
        missions: [{
            items: [{
                packageName: "dummy.package.4"
            }]
        }]
    }, {
        title: "dummy.title.5",
        missions: [{
            items: [{
                packageName: "dummy.package.5"
            }]
        }]
    }, {
        title: "dummy.title.6",
        missions: [{
            items: [{
                packageName: "dummy.package.6"
            }]
        }]
    }];

    beforeEach(done => {
        stgApps.create(stgAppsData)
            .then(() => stgBetaTests.create(stgBetaTestsData))
            .then(() => Apps.create(appsData))
            .then(() => BetaTests.create(betaTestsData))
            .then(() => done())
            .catch(err => done(err));
    });

    describe('syncDataToStg 호출 시', () => {
        it('전달받은 PrdDB의 컬렉션 데이터를 StgDB와 동기화시킨다.', done => {
            syncDataToStg('beta-tests');

            stgBetaTests.find({})
                .sort({title: 1})
                .then(betaTests => {
                    betaTests.length.should.be.eql(3);
                    betaTests[0].title.should.be.eql(betaTestsData[0].title);
                    betaTests[1].title.should.be.eql(betaTestsData[1].title);
                    betaTests[2].title.should.be.eql(betaTestsData[2].title);
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('syncAppsDataToStg 호출 시', () => {
        it('PrdDB의 베타테스트에 packageName이 등록된 앱 데이터만 StgDB와 동기화시킨다.', done => {
            syncAppsDataToStg()
                .then(() => stgApps.find({}).sort({packageName: 1}))
                .then(apps => {
                    apps.length.should.be.eql(3);
                    apps[0].packageName.should.be.eql(appsData[0].packageName);
                    apps[1].packageName.should.be.eql(appsData[1].packageName);
                    apps[2].packageName.should.be.eql(appsData[2].packageName);
                    done();
                })
                .catch(err => done(err));
        });
    });

    afterEach(done => {
        stgApps.deleteMany({})
            .then(() => stgBetaTests.deleteMany({}))
            .then(() => Apps.deleteMany({}))
            .then(() => BetaTests.deleteMany({}))
            .then(() => done())
            .catch(err => done(err));
    })
});