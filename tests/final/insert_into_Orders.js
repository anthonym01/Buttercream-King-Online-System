// insert_into_Orders test
const database = require('../../modules/database_wrapper');
const logs = require('../../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test() {
    try {

        logs.info("Starting add order test");

        const username = await text('What is your name?', { default: 'samuel' });

        const data = {//test data, im not re-implimenting half of the app for a test
            username: username,
            Items: [
                { cakeid: 1, quantity: 2 },
                { cakeid: 2, quantity: 3 }
            ],
            Status: 'pending',
            total_price: 100.00,
            Date: new Date()
        }

        logs.info('got payload: ', data);//{ username, Items: [{cakeid:#,quantity:#}], Status,total_price: float,Date: ISOString };

        const order = {
            Items: JSON.stringify(data.Items),
            Status: data.Status,
            total_price: Number(data.total_price),
            Date: new Date()//data.Date
        }
        if (typeof (data.username) != 'undefined') {
            database.insert_into_Orders(order).then((result) => {
                logs.info('Order submitted: ', result);

                const orderid = result.insertId;
                //Update the Customer with the order id
                database.getCustomersViaUsername(data.username).then((result) => {
                    let old_order_data = JSON.parse(result.orders) || [];
                    logs.info('Old order data: ', old_order_data, ' for user: ', data.username);
                    console.log('Datatype: ', typeof (old_order_data));

                    logs.info('Adding new order to user: ', old_order_data);
                    old_order_data.push(orderid);
                    logs.info('New orders data: ', old_order_data);

                    // Update the cart in the database
                    database.updateCustomer(data.username, { orders: JSON.stringify(old_order_data), Cart_items: JSON.stringify([]) });
                    // Clear the cart after order is submitted
                    logs.info('Updated user orders: ', old_order_data);
                    //res.end(JSON.stringify({ status: "success" }));

                    // update loyalty points
                    let loyaltypoints = Math.floor(data.total_price / 100);
                    logs.info('Adding loyalty points: ', loyaltypoints, ' for user: ', data.username);
                    database.updateCustomer(data.username, { loyalty_points: Number(result.loyalty_points) + Number(loyaltypoints) });
                    logs.info('------------------------------');
                    logs.info('--Test PASSED-- :)');
                });
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
