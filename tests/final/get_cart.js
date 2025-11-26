// '/get/cart' test
// Function: get cart 
const database = require('../../modules/database_wrapper');
const logs = require('../../modules/logger');
const readline = require('node:readline');

try {
    logs.info("Starting /get/cart test");

    const reader = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
    reader.question(`Enter testing username to get cart data:\n`, data => {
        logs.info(`got input ${data}`);
        reader.close();// close the readline interface

        database.getCustomersViaUsername(data).then((result) => {
            if (typeof (result) == 'undefined' || result.length == 0) {
                logs.info("User not found in database");
                logs.info("\n-------------------------------------------------");
                logs.info("test /get/cart FAILED!! :( due to user not found");
                return;
            }

            const cartdata = JSON.parse(result.Cart_items) || [];
            logs.info('got cart data: ', cartdata, ' for user: ', data);
            //test passes at end of callback swamp
            logs.info("--------------------------------------------------");
            logs.info("--TEST PASSED-- :)");
        });
    })

} catch (error) {
    logs.info("\n\n--------------------------------------------------");
    logs.error(error);
    logs.info("--------------------------------------------------");
    logs.info("test /get/cart FAILED!! :( due to runtime error");
}