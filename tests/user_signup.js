// Description: This is a test file for the user signup process.
// It tests the user signup process by checking if a user exists in the database.
///post/signup test

const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test() {
    try {

        logs.info("Starting template test");

        const username = await text('Username?', { default: 'testing2' });
        const password = await text('Password?', { default: '0000' });
        if (password.length < 4) {
            logs.info('Password must be at least 4 characters long');
            test();
            return;
        }
        if (username.length < 4) {
            logs.info('Username must be at least 4 characters long');
            test();
            return;
        }
        if (username.length > 20) {
            logs.info('Username must be at most 20 characters long');
            test();
            return;
        }
        if (password.length > 20) {
            logs.info('Password must be at most 20 characters long');
            test();
            return;
        }
        const data = {
            user: username,
            pass: password
        }
        logs.info('got payload: ', data);// { user, pass };

        if (typeof (data.user) != 'undefined' && typeof (data.pass) != 'undefined') {
            database.getCustomersViaUsername(data.user).then((result) => {
                if (typeof (result) == 'undefined' || result.length == 0) {
                    logs.info('User does not exist, creating new user: ', data.user);
                    // Create new user
                    const newUser = {
                        username: data.user,
                        password: data.pass,
                        Cart_items: JSON.stringify([]),
                        orders: JSON.stringify([]),
                        Delivery_address: JSON.stringify({}),
                        payment_details: JSON.stringify({}),
                        loyalty_points: 0,
                    }
                    //Insert new user into database
                    database.insert_into_Customers(newUser).then((result) => {
                        logs.info('User created: ', result);

                        //test passes at end of callback swamp
                        logs.info("--------------------------------------------------");
                        logs.info("--TEST PASSED-- :)");
                    });
                } else {
                    //test fails as user already exists
                    logs.info('User already exists: ', data.user);
                    logs.info("--------------------------------------------------");
                    logs.info("test FAILED!!");
                }
            });
        }
    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test FAILED!! :( due to runtime error");
    }

}
test();
