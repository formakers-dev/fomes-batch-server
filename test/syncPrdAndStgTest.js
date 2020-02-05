const chai = require('chai');
const should = chai.should();
const config = require('../config');
const mongoose = require('mongoose');
const prdApps = require('../models/apps');
const prdBetaTests = require('../models/betaTests');
const {syncFromPrdToStg, syncAppsFromPrdToStg} = require('../jobs/syncFromPrdToStg');


const stgDbConnection = mongoose.createConnection(config.fomesStgDbUrl, {useNewUrlParser: true});
const stgApps = stgDbConnection.model('apps', prdApps.schema);
const stgBetaTests = stgDbConnection.model('beta-tests', prdBetaTests.schema);

describe('SyncFromPrdToStg Test', () => {
    const prdAppsData = [{
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

    const prdBetaTestsData = [{
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
            .then(() => prdApps.create(prdAppsData))
            .then(() => prdBetaTests.create(prdBetaTestsData))
            .then(() => done())
            .catch(err => done(err));
    });

    describe('syncFromPrdToStg 호출 시', () => {
        it('전달받은 PrdDB의 컬렉션 데이터를 StgDB와 동기화시킨다.', done => {
            syncFromPrdToStg('beta-tests');

            stgBetaTests.find({})
                .sort({title: 1})
                .then(betaTests => {
                    betaTests.length.should.be.eql(3);
                    betaTests[0].title.should.be.eql(prdBetaTestsData[0].title);
                    betaTests[1].title.should.be.eql(prdBetaTestsData[1].title);
                    betaTests[2].title.should.be.eql(prdBetaTestsData[2].title);
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('syncAppsFromPrdToStg 호출 시', () => {
        it('PrdDB의 베타테스트에 packageName이 등록된 앱 데이터만 StgDB와 동기화시킨다.', done => {
            syncAppsFromPrdToStg()
                .then(() => stgApps.find({}).sort({packageName: 1}))
                .then(apps => {
                    apps.length.should.be.eql(3);
                    apps[0].packageName.should.be.eql(prdAppsData[0].packageName);
                    apps[1].packageName.should.be.eql(prdAppsData[1].packageName);
                    apps[2].packageName.should.be.eql(prdAppsData[2].packageName);
                    done();
                })
                .catch(err => done(err));
        });
    });

    afterEach(done => {
        stgApps.deleteMany({})
            .then(() => stgBetaTests.deleteMany({}))
            .then(() => prdApps.deleteMany({}))
            .then(() => prdBetaTests.deleteMany({}))
            .then(() => done())
            .catch(err => done(err));
    })
});