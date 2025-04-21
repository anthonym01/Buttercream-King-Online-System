//'/post/addtocart' test
const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const input = require('input');
const Table = require('easy-table');

async function test() {
    try {
        logs.info("Starting '/post/addtocart' test");
        database.getCakes().then(async (results) => {
            console.log('Database retuned inventory:');
            //filter uuids into an array
            let uuids = [];
            for (let index in results) {
                uuids.push(results[index].uuid);
            }
            //console.log(uuids);

            let table = new Table;
            results.forEach(function (product) {
                table.cell('Product Id', product.uuid)
                table.cell('Title', product.Title)
                table.cell('Description', product.Description)
                table.cell('Price, JMD', product.price, Table.number(2))
                table.newRow()
            });

            logs.info(table.toString());

            const uuid = await input.text('Select a uuid: ', { default: '1' });

            //check if uuid is valid
            let found = false;
            for (let index in results) {
                if (results[index].uuid == uuid) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                logs.info("--------------------------------------------------");
                logs.info("test failed, invalid uuid");
                return;
            }

            const quantity = await input.text('Enter quantity: ', { default: '1' });
            const username = await input.text('Enter username: ', { default: 'samuel' });

            database.getCustomersViaUsername(username).then((result) => {
                //logs.info('Lookup result: ', result);
                if (typeof (result) != 'undefined' && result.length != 0 ) {
                    //continue;
                }
                else {
                    logs.info("\n\n--------------------------------------------------");
                    logs.info("test failed, user does not exist");
                }
            });

            const data = { cakeid: uuid, quantity: quantity, username: username };

            //expects { cakeid, quantity, username };
            if (typeof (data.cakeid) != 'undefined' && typeof (data.quantity) != 'undefined' && typeof (data.username) != 'undefined') {
                // Get old cart data
                database.getCustomersViaUsername(data.username).then((result) => {
                    let oldcart = JSON.parse(result.Cart_items) || [];
                    logs.info('Old cart data: ', oldcart, ' for user: ', data.username);
                    console.log('Datatype: ', typeof (oldcart));
                    // Check if cake is already in cart
                    let existingItemindex = false;
                    for (let i = 0; i < oldcart.length; i++) {
                        if (oldcart[i].cakeid === data.cakeid) {
                            existingItemindex = i;
                            logs.info('Found existing item in cart: ', oldcart[i]);
                            break;
                        }
                    }
                    if (existingItemindex !== false) {
                        // Update quantity if cake is already in cart
                        oldcart[existingItemindex].quantity = Number(oldcart[existingItemindex].quantity) + Number(data.quantity);
                        logs.info('Updated existing item: ', oldcart[existingItemindex]);
                    } else {
                        // Add new item to cart
                        logs.info('Adding new item to cart: ', data);
                        oldcart.push({ cakeid: data.cakeid, quantity: data.quantity });
                        logs.info('New cart data: ', oldcart);
                    }
                    // Update the cart in the database
                    database.updateCustomer(data.username, { Cart_items: JSON.stringify(oldcart) });
                    logs.info('Updated cart: ', result);

                    //test passed
                    logs.info("--------------------------------------------------");
                    logs.info("--TEST PASSED-- :)");
                });

            }
        });

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test name FAILED!! :( due to runtime error");
    }
}
test();
