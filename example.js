// Usage example of ap-top25-ncaaf package
// See https://www.npmjs.com/package/ap-top25-ncaaf

var aptop25ncaaf = require('ap-top25-ncaaf');

console.log('Usage example of the ap-top25-ncaaf package.')

aptop25ncaaf.getAPTop25Data( function(error, data) {
        if (!error) {
            console.log(JSON.stringify(data, null, 2));      
        }
        else {
            console.log('Some error occured.');
        }
    });