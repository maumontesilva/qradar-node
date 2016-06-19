/**
 * Created by maurosil on 15/05/2016.
 */

var fs = require('fs');
var fileName;

var Database = function() {
    fileName = __dirname + '/db.txt';

    if(!fs.existsSync(fileName)) {
        fs.openSync(fileName, 'w');
    }
};

Database.prototype.read = function () {
    return fs.readFileSync(fileName).toString();
};

Database.prototype.write = function(data) {
    fs.writeFileSync(fileName, JSON.stringify(data));
};

module.exports = Database;