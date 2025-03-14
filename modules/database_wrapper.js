const SQLcredentials = require('./SQL_credentials');
const logs = require('./logger');
const mysql = require('mysql');

//console.log(SQLcredentials);

const connectionmanager = {
    test: async function () {// Test Database connection
        const connection = mysql.createConnection(SQLcredentials);

        connection.connect(function (err) {
            if (err) {
                logs.error('error connecting: ' + err.stack);
                return;
            }

            logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);
            setTimeout(() => {
                connection.end()
            }, 100);
        });
    },
    getCakes: async function () {
        return new Promise((resolve, reject) => {//Prommise to gather cakes from the `inventory` table of the database

            //Create sql connection
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {//initalize connection
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                // Execute SQL Query
                connection.query('SELECT * FROM `inventory`', function (error, results, fields) {
                    if (error) throw error;
                    console.log('From inventory got : ', results);
                    resolve(results);// 'resolve' results to be accecible to Promise
                    connection.end();//destroy connection, so another query can take place
                });
            });
        });
    },
    getCakesViaUuid: async function (uuid) {
        return new Promise((resolve, reject) => {// Gather data asyncronusly
            logs.info('Looking for cake with uuid: ',)
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }
                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `inventory` WHERE `uuid` = ?', uuid, function (error, results, fields) {

                    if (error) throw error;
                    console.log('From inventory got : ', results);
                    resolve(results[0]);
                    connection.end();
                });
            });
        });
    },
    insert_into_Cakes: async function (injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to insert ', injection, 'into Inventory')
        let query = connection.query('INSERT INTO inventory SET ?', injection, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql); // INSERT INTO
        connection.end();
    },

}

module.exports = connectionmanager;