const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
//const readline = require('node:readline');
const Table = require('easy-table');
const input = require('input');
const { text, checkboxes } = input;

async function test (){
    try {

        logs.info("Starting template test");

        const name = await text('What is your name?', { default: 'Fred' });

        const colors = await checkboxes(`OK ${name}, choose some colors`, [
            'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'rebeccapurple'
        ]);

        console.log('You chose:\n  ', colors.join('\n  '));
        //test passes at end of callback swamp
        logs.info("--------------------------------------------------");
        logs.info("--TEST PASSED-- :)");


    } catch (error) {
        logs.info("\n\n--------------------------------------------------");
        logs.error(error);
        logs.info("--------------------------------------------------");
        logs.info("test name FAILED!! :( due to runtime error");
    }

}
test();
