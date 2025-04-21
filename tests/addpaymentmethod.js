// '/post/addpaymentmethod' test

const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test() {
    try {

        logs.info("Starting addpaymentmethod test");

        const username = await text('Username: ', { default: 'samuel' });
        const name_on_card = await text('Name on card?', { default: 'Samuel Matheson' });
        if(!name_on_card || name_on_card == '') {
            logs.info("\n\n--------------------------------------------------");
            logs.info("Name on card is required");
            logs.info("test FAILED!!");
            return;
        }
        const Credit_card_number = await text('Credit card number?', { default: '0000000000000000' });
        if(!Credit_card_number || Credit_card_number == '') {
            if(Credit_card_number.length < 16 || Credit_card_number.length > 16) {
                logs.info("\n\n--------------------------------------------------");
                logs.info("Credit card number is invalid , must be 16 digits");
                logs.info("test FAILED!!");
                return;
            }
            logs.info("\n\n--------------------------------------------------");
            logs.info("Credit card number is required");
            logs.info("test FAILED!!");
            return;
        }
        const Expiry_date = await text('Expiry date?', { default: '12/27' });
        if(!Expiry_date || Expiry_date == '') {
            logs.info("\n\n--------------------------------------------------");
            logs.info("Expiry date is required");
            logs.info("test FAILED!!");
            return;
        }
        if(Expiry_date.length < 5 || Expiry_date.length > 5) {
            logs.info("\n\n--------------------------------------------------");
            logs.info("Expiry date is invalid , must be in format MM/YY");
            logs.info("test FAILED!!");
            return;
        }
        const CVV = await text('CVV?', { default: '123' });
        if(!CVV || CVV == '') {
            logs.info("\n\n--------------------------------------------------");
            logs.info("CVV is required");
            logs.info("test FAILED!!");
            return;
        }
        if(CVV.length < 3 || CVV.length > 3) {
            logs.info("\n\n--------------------------------------------------");
            logs.info("CVV is invalid , must be 3 digits");
            logs.info("test FAILED!!");
            return;
        }

        const data = {
            card: {
                name: name_on_card,
                number: Credit_card_number,
                expire: Expiry_date,
                cvc: CVV
            },
            username: username
        };
        try {
            logs.info('got payload: ', data);//expects { card, username };

            if (typeof (data.card) != 'undefined' && typeof (data.username) != 'undefined') {
                database.updateCustomer(data.username, { payment_details: JSON.stringify(data.card) });
                logs.info('Updated payment method: ', data.card, ' for user: ', data.username);
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
