
// ViewAllOrders
const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test (){
    try {
        
        logs.info("Starting ViewAllOrders test");
        logs.info('for test user assumed to be owner');

        database.getOrders().then((results) => {
            let table = new Table;
            results.forEach(function (order) {
                table.cell('Product Id', order.ordernumber)
                table.cell('items', order.Items)
                table.cell('Date', order.Date)
                table.cell('Status', order.Status)
                table.cell('Price, JMD', order.total_price, Table.number(2))
                table.newRow()
            });

            logs.info(table.toString());
            logs.info("--------------------------------------------------");
        logs.info("--TEST PASSED-- :)");
        });
        


    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test name FAILED!! :( due to runtime error");
    }

}
test();
