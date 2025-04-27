// delete cake test
// Delete Cake()

const database = require('../../modules/database_wrapper');
const Table = require('easy-table');
const logs = require('../../modules/logger');
const input = require('input');

async function test() {
    try {

        logs.info("Starting delete cake test");
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
            logs.info("Select a product to delete by entering the product id");
            logs.info("--------------------------------------------------");
            //prompt user for input
            const prompt = await input.text('Select a uuid: ', { default: String(uuids[uuids.length - 1]) });
            
            //check if uuid is valid
            if (uuids.includes(Number(prompt))) {
                //valid uuid
                logs.info("valid uuid");
                
    
            }else{
                //invalid uuid
                logs.info("--------------------------------------------------");
                logs.info("test failed, invalid uuid");
                return;
            }
            //delete cake

        });

    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test name FAILED!! :( due to runtime error");
    }
}
test();
