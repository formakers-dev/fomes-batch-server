const AppUsages = require('../models/appUsages');
const Apps = require('../models/apps');
const UncrawledApps = require('../models/uncrawledApps');

const insertUncrawledApps = () => {
    return UncrawledApps.distinct('packageName')
        .then(registeredUncrawledApps => Apps.distinct('packageName', {packageName: {$nin: registeredUncrawledApps}}))
        .then(apps => AppUsages.distinct('packageName', {packageName: {$nin: apps}}))
        .then(uncrawledPackageNames => {
            const uncrawledApps = uncrawledPackageNames.map(app => {
                return {
                    packageName: app
                }
            });

            return UncrawledApps.insertMany(uncrawledApps);
        });
};

module.exports = {insertUncrawledApps};


