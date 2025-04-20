const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const readline = require('node:readline');

try {
    logs.info("Starting template test");

    // Read username from console
    const template_input = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
    template_input.question(`input example\n`, input => {
        logs.info(`got input ${input}`);
        template_input.close();// close the readline interface

        //test passes at end of callback swamp
        logs.info("--------------------------------------------------");
        logs.info("--TEST PASSED-- :)");
    });

} catch (error) {
    logs.info("\n\n--------------------------------------------------");
    logs.error(error);
    logs.info("--------------------------------------------------");
    logs.info("test FG01 FAILED!! :( due to runtime error");
}