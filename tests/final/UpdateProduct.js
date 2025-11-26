// staff 'UpdateProduct' test
// Update Cake()

const database = require('../../modules/database_wrapper');
const logs = require('../../modules/logger');
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

            const uuidraw = await input.text('Select a uuid: ', { default: uuids[0] });

            //check if uuid is valid
            let found = false;
            let uuidex;
            for (let index in results) {
                if (results[index].uuid == uuidraw) {
                    uuidex = index;
                    found = true;
                    break;
                }
            }
            if (!found) {
                logs.info("--------------------------------------------------");
                logs.info("test failed, invalid uuid");
                return;
            }

            //results[uuid] .Title .Description .price
            const title = await input.text('Enter new title: ', { default: results[uuidex].Title });
            const description = await input.text('Enter new description: ', { default: results[uuidex].Description });
            const price = await input.text('Enter new price: ', { default: results[uuidex].price });
            //check if price is a number
            if (isNaN(price)) {
                logs.info("--------------------------------------------------");
                logs.info("test failed, price is not a number");
                return;
            }
            //check if price is a positive number
            if (price < 0) {
                logs.info("--------------------------------------------------");
                logs.info("test failed, price is not a positive number");
                return;
            }
            //update product
            const cake ={
                Title: title,
                Description: description,
                price: price
            }
            database.updateCake(uuidraw, cake);
            logs.info('Updated product: ', uuidraw);
            //test passes at end of callback swamp
            logs.info("--------------------------------------------------");
            logs.info("--TEST PASSED-- :)");

        });

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test FAILED!! :( due to runtime error");
    }
}
test();
