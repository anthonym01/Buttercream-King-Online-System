// /get/catalog test

const database = require('../modules/database_wrapper');
const Table = require('easy-table');
const logs = require('../modules/logger');

async function test() {
    try {

        logs.info("Starting /get/catalog test");
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

            logs.info(table.toString()); ("--------------------------------------------------");
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
