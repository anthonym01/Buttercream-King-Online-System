// staff 'UpdateProduct' test
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

            //const quantity = await input.text('Enter quantity: ', { default: '1' });
            //const username = await input.text('Enter username: ', { default: 'samuel' });

        });

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test FAILED!! :( due to runtime error");
    }
}
test();
