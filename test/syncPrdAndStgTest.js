const chai = require('chai');
const fs = require('fs');
const should = chai.should();
const config = require('../config');
const mongoose = require('mongoose');
const prdDbConnection = require('../db').FOMES;
const syncFromPrdToStg = require('../jobs/syncFromPrdToStg');

const dummySchema = mongoose.Schema({
    dummyField: String,
});

const stgDbConnection = mongoose.createConnection(config.fomesStgDbUrl, {useNewUrlParser: true});
const stgDummy = stgDbConnection.model('dummys', dummySchema);
const prdDummy = prdDbConnection.model('dummys', dummySchema);

describe('SyncFromPrdToStg Test', () => {
    const stgData = [{
        dummyField: "dummy.1"
    }, {
        dummyField: "dummy.2"
    }, {
        dummyField: "dummy.3"
    }];

    const prdData = [{
        dummyField: "dummy.4"
    }, {
        dummyField: "dummy.5"
    }, {
        dummyField: "dummy.6"
    }];


    before(done => {
        stgDummy.create(stgData)
            .then(() => prdDummy.create(prdData))
            .then(() => done())
            .catch(err => done(err));
    });

    describe('syncFromPrdToStg 호출 시', () => {
        it('전달받은 PrdDB의 컬렉션 데이터를 StgDB와 동기화시킨다.', done => {
            syncFromPrdToStg('dummys');

            stgDummy.find({})
                .sort({dummyField: 1})
                .then(dummys => {
                    dummys.length.should.be.eql(3);
                    dummys[0].dummyField.should.be.eql(prdData[0].dummyField);
                    dummys[1].dummyField.should.be.eql(prdData[1].dummyField);
                    dummys[2].dummyField.should.be.eql(prdData[2].dummyField);
                    done();
                })
                .catch(err => done(err));
        });

        it('import 후 export된 임시파일을 삭제한다.', () => {
            fs.existsSync('/tmp/dummys.json').should.be.false;
        });
    });

    after(done => {
        stgDummy.deleteMany({})
            .then(() => prdDummy.deleteMany({}))
            .then(() => done())
            .catch(err => done(err));
    })
});