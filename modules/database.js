const SQLcredentials = require('./SQL_credentials');
const logs = require('./logger');
const mysql = require('mysql');

let connection = mysql.createConnection(SQLcredentials);
//console.log(SQLcredentials);

const connectionmanager = {
    test: async function () {
        connection.connect(function (err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);
            setTimeout(() => { connection.end() }, 100);
        });
    }
}

module.exports = connectionmanager;