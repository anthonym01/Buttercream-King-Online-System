const SQLcredentials = require('./SQL_credentials');
const logs = require('./logger');
const mysql = require('mysql');

//console.log(SQLcredentials);

const connectionmanager = {
    test: async function () {
        const connection = mysql.createConnection(SQLcredentials);

        connection.connect(function (err) {
            if (err) {
                logs.error('error connecting: ' + err.stack);
                return;
            }

            logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);
            setTimeout(() => { connection.end() }, 100);
        });
    },
    getInventory: async function () {
        return new Promise((resolve, reject) => {// Gather data asyncronusly
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    //connection.end();
                    reject(err);
                }
                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `inventory`', function (error, results, fields) {

                    if (error) throw error;
                    console.log('From inventory got : ', results);
                    resolve(results);
                    connection.end();
                });
            });
        });
    },

}

module.exports = connectionmanager;