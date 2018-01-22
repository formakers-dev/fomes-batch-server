const AppUsages = require('../models/appUsages');
const Apps = require('../models/apps');
const UncrawledApps = require('../models/uncrawledApps');

const insertUncrawledApps = () => {

    return Apps.distinct('packageName').then((apps) => {
        return AppUsages.distinct('packageName', {packageName: {$nin: apps}});
    }).then(uncrawledApps => {
        return UncrawledApps.distinct('packageName', {packageName: {$nin: uncrawledApps}});
    }).then(uncrawledApps => {
        const data = uncrawledApps.map(data => {
            return {packageName: data}
        });
        return UncrawledApps.insertMany(data);
    })
};

module.exports = {insertUncrawledApps};