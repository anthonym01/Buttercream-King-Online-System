//LoginStaff test

const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test() {
    try {

        logs.info("Starting staff login test");

        const username = await text('What is your username?', { default: 'owner' });
        const password = await text('What is your password?', { default: 'owner' });

        const data = { user: username, pass: password };
        logs.info('got payload: ', data);//expects { user, pass };

        database.getStaffViaUsername(data.user).then((result) => {
            logs.info('Lookup result: ', result);
            if (typeof (result) == 'undefined' || result.length == 0 && result.password != data.pass) {
                logs.info('User does not exist or password is incorrect: ', data.user);
                logs.info('--TEST FAILED-- :)');
            }
            else {
                logs.info('User exists and password is correct: ', data.user);
                logs.info('--TEST PASSED-- :)');
                

            }
        });

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test FAILED!! :( due to runtime error");
    }

}
test();
