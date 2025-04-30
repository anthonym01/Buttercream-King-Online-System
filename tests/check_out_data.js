//'/get/checkoutdata' test

const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test() {
    try {

        logs.info("Starting '/get/checkoutdata' test");

        const username = await text('Enter username to search for', { default: 'samuel' });

        database.getCustomersViaUsername(username).then((result) => {
            //logs.info('Checkout data for : ', result);
            if (typeof (result) != 'undefined') {
                logs.info('Checkout data for : ',{ deliveryinfo: result.Delivery_address, paymentinfo: result.payment_details });
            } else {
                throw new Error("No data found for the given username");
            }
            //test passes at end of callback swamp
            logs.info("--------------------------------------------------");
            logs.info("--TEST PASSED-- :)");
        });

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test FAILED!!");
    }

}
test();
