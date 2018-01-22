const AppUsages = require('../models/appUsages');
const Apps = require('../models/apps');
const UncrawledApps = require('../models/uncrawledApps');

const insertUncrawledApps = () => {

    // appUsage에 있는 packageName중 apps에 없는 것 추출
    // list에 있는 packageName중 uncawledApps에 없는 것 추출
    // insert
    return Apps.distinct('packageName').then((apps) => {
        return AppUsages.distinct('packageName', {packageName: {$nin: apps}});
    }).then(uncrawledApps => {
        return uncrawledApps.forEach(data => {
            UncrawledApps.findOneAndUpdate(
                {
                    'packageName': data
                },
                {$set: {'packageName': data}},
                {upsert: true}).exec()
        });
    })
};

module.exports = {insertUncrawledApps};


