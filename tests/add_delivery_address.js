// '/post/adddeliveryaddress' test

const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test (){
    try {

        logs.info("Starting adddeliveryaddress test");

        const username = await text('Username: ', { default: 'samuel' });
        const Delivery_address = await text('Address?', { default: 'Locataion in place on street in city' });
        const data = {
            Delivery_address: Delivery_address,
            username: username
        };

        logs.info('got payload: ', data);//expects { address, username };
        try {
            if (typeof (data.Delivery_address) != 'undefined' && typeof (data.username) != 'undefined') {
                database.updateCustomer(data.username, { Delivery_address: JSON.stringify({ address: data.Delivery_address }) });
                logs.info('Updated delivery address: ', data.Delivery_address, ' for user: ', data.username);
                //test passes at end of callback swamp
                logs.info("--------------------------------------------------");
                logs.info("--TEST PASSED-- :)");
            }
        } catch (error) {
            //test fail
            logs.info("\n\n--------------------------------------------------");
            logs.error(error);
            logs.info("--------------------------------------------------");
            logs.info("test FAILED!!");
        }

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test name FAILED!! :( due to runtime error");
    }

}
test();
