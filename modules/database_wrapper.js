const SQLcredentials = require('./SQL_credentials.json');
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
    /*
        Cakes Table
    */
    // SELECT * FROM `cakes`
    getCakes: async function () {
        return new Promise((resolve, reject) => {//Prommise to gather cakes from the `cakes` table of the database

            //Create sql connection
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {//initalize connection
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                // Execute SQL Query
                connection.query('SELECT * FROM `cakes`', function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From cakes got : ', results);
                    resolve(results);// 'resolve' results to be accecible to Promise
                    connection.end();//destroy connection, so another query can take place
                });
            });
        });
    },
    //'SELECT * FROM `cakes` WHERE `uuid` = ?'
    getCakesViaUuid: async function (uuid) {
        return new Promise((resolve, reject) => {// Gather data asyncronusly
            logs.info('Looking for cake with uuid: ',uuid)
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }
                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `cakes` WHERE `uuid` = ?', uuid, function (error, results, fields) {

                    if (error) throw error;
                    //logs.info('From cakes got : ', results);
                    resolve(results[0]);// 0, because only one cake is expected
                    connection.end();
                });
            });
        });
    },
    // INSERT INTO cakes SET ?
    insert_into_Cakes: async function (injection) {
        return new Promise((resolve, reject) => {
            let connection = mysql.createConnection(SQLcredentials);
            logs.info('Attempt to insert ', injection, 'into cakes')
            let query = connection.query('INSERT INTO cakes SET ?', injection, function (error, results, fields) {
                if (error) {
                    logs.error(error)
                    reject(error);
                };
                console.log("results data: ", results);
                resolve(results);
            });
            logs.info(query.sql); // INSERT INTO
            connection.end();
        });
    },
    // DELETE FROM `cakes` WHERE `uuid` = ?
    deleteCake: async function (uuid) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to delete cake with uuid: ', uuid)
        let query = connection.query('DELETE FROM `cakes` WHERE `uuid` = ?', uuid, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql); // DELETE FROM
        connection.end();
    },
    // UPDATE `cakes` SET ? WHERE `uuid` = ?
    updateCake: async function (uuid, injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to update cake with uuid: ', uuid, ' with ', injection)
        let query = connection.query('UPDATE `cakes` SET ? WHERE `uuid` = ?', [injection, uuid], function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql); // UPDATE
        connection.end();
    },
    /*
        Customers Table
    */
    //'SELECT * FROM `Customers`'
    getCustomers: async function () {
        logs.info('SELECT * FROM `Customers`');
        return new Promise((resolve, reject) => {
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Customers`', function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From customers got : ', results);
                    resolve(results);
                    connection.end();
                });
            });
        });
    },
    //'SELECT * FROM `Customers` WHERE `uuid` = ?'
    getCustomersViaUuid: async function (uuid) {
        return new Promise((resolve, reject) => {
            logs.info('Looking for customer with uuid: ', uuid)

            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Customers` WHERE `uuid` = ?', uuid, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From customers got : ', results);
                    resolve(results[0]);
                    connection.end();
                });
            });
        });
    },
    //'SELECT * FROM `Customers` WHERE `username` = ?'
    getCustomersViaUsername: async function (username) {
        return new Promise((resolve, reject) => {
            logs.info('Looking for customer with username: ', username)

            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Customers` WHERE `username` = ?', username, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From customers got : ', results);
                    resolve(results[0]);
                    connection.end();
                });
            });
        });
    },
    // INSERT INTO Customers SET ?
    insert_into_Customers: async function (injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to insert ', injection, 'into Customers')
        let query = connection.query('INSERT INTO Customers SET ?', injection, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
    // DELETE FROM `Customers` WHERE `uuid` = ?
    deleteCustomer: async function (uuid) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to delete customer with uuid: ', uuid)
        let query = connection.query('DELETE FROM `Customers` WHERE `uuid` = ?', uuid, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
    // UPDATE `Customers` SET ? WHERE `uuid` = ?
    updateCustomer: async function (username, injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to update customer with uuid: ', username, ' with ', injection)
        let query = connection.query('UPDATE `Customers` SET ? WHERE `username` = ?', [injection, username], function (error, results, fields) {
            if (error) logs.error(error);
        });
        //logs.info(query.sql);
        connection.end();
    },
    /*
        Orders Table
    */
    //'SELECT * FROM `Orders`'
    getOrders: async function () {
        return new Promise((resolve, reject) => {
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Orders`', function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From Orders got : ', results);
                    resolve(results);
                    connection.end();
                });
            });
        });
    },
    //'SELECT * FROM `Orders` WHERE `uuid` = ?'
    getOrdersViaUuid: async function (uuid) {
        return new Promise((resolve, reject) => {
            logs.info('Looking for order with uuid: ', uuid)

            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Orders` WHERE `ordernumber` = ?', uuid, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From Orders got : ', results);
                    resolve(results[0]);
                    connection.end();
                });
            });
        });
    },
    getOrdersViaStatus: async function (status) {
        return new Promise((resolve, reject) => {
            logs.info('Looking for order with status: ', status)

            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Orders` WHERE `status` = ?', status, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From Orders got : ', results);
                    resolve(results);
                    connection.end();
                });
            });
        });
    },
    // INSERT INTO Orders SET ?
    insert_into_Orders: async function (injection) {
        return new Promise((resolve, reject) => {
            let connection = mysql.createConnection(SQLcredentials);
            logs.info('Attempt to insert ', injection, 'into Orders')
            let query = connection.query('INSERT INTO Orders SET ?', injection, function (error, results, fields) {
                if (error) {
                    logs.error(error);
                    reject(error);
                }
                logs.info("results data: ", results);
                resolve(results);
            });
            logs.info(query.sql);
            connection.end();
        });
    },
    // DELETE FROM `Orders` WHERE `uuid` = ?
    deleteOrder: async function (uuid) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to delete order with uuid: ', uuid)
        let query = connection.query('DELETE FROM `Orders` WHERE `ordernumber` = ?', uuid, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
    // UPDATE `Orders` SET ? WHERE `uuid` = ?
    updateOrder: async function (uuid, injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to update order with uuid: ', uuid, ' with ', injection)
        let query = connection.query('UPDATE `Orders` SET ? WHERE `ordernumber` = ?', [injection, uuid], function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
    /*
        Staff Table
    */
    //'SELECT * FROM `Staff`'
    getStaff: async function () {
        return new Promise((resolve, reject) => {
            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Staff`', function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From Staff got : ', results);
                    resolve(results);
                    connection.end();
                });
            });
        });
    },
    //'SELECT * FROM `Staff` WHERE `username` = ?'
    getStaffViaUsername: async function (username) {
        return new Promise((resolve, reject) => {
            logs.info('Looking for staff with username: ', username)

            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Staff` WHERE `username` = ?', username, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From Staff got : ', results);
                    resolve(results[0]);
                    connection.end();
                });
            });
        });
    },
    //'SELECT * FROM `Staff` WHERE `uuid` = ?'
    getStaffViaUuid: async function (uuid) {
        return new Promise((resolve, reject) => {
            logs.info('Looking for staff with uuid: ', uuid)

            let connection = mysql.createConnection(SQLcredentials);

            connection.connect(function (err) {
                if (err) {
                    logs.error('error connecting: ' + err.stack);
                    reject(err);
                }

                logs.info('connected as id ', connection.threadId, ' to mariadb server at: ', SQLcredentials.host);

                connection.query('SELECT * FROM `Staff` WHERE `id` = ?', uuid, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('From Staff got : ', results);
                    resolve(results[0]);
                    connection.end();
                });
            });
        });
    },
    // INSERT INTO Staff SET ?
    insert_into_Staff: async function (injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to insert ', injection, 'into Staff')
        let query = connection.query('INSERT INTO Staff SET ?', injection, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
    // DELETE FROM `Staff` WHERE `uuid` = ?
    deleteStaff: async function (uuid) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to delete staff with uuid: ', uuid)
        let query = connection.query('DELETE FROM `Staff` WHERE `id` = ?', uuid, function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
    // UPDATE `Staff` SET ? WHERE `uuid` = ?
    updateStaff: async function (uuid, injection) {
        let connection = mysql.createConnection(SQLcredentials);
        logs.info('Attempt to update staff with uuid: ', uuid, ' with ', injection)
        let query = connection.query('UPDATE `Staff` SET ? WHERE `id` = ?', [injection, uuid], function (error, results, fields) {
            if (error) logs.error(error);
        });
        logs.info(query.sql);
        connection.end();
    },
}

module.exports = connectionmanager;