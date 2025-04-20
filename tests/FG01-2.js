const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');
const readline = require('node:readline');
//const read = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
const { exec } = require('child_process');

try {
    logs.info("Starting test FG01-2");
    // Read username from console
    const read_username = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
    read_username.question(`Enter testing username\n`, name => {
        logs.info(`got input ${name}`);
        read_username.close();// close the readline interface

        const read_password = readline.createInterface({ input: process.stdin, output: process.stdout }); //emulate node console
        read_password.question(`Enter testing password\n`, pass => {
            logs.info(`got input ${pass}`);
            read_password.close();// close the readline interface
            // Execute the test command

            //get user from database
            database.getCustomersViaUsername(name).then((result) => {
                //logs.info('Lookup result: ', result);
                if (typeof (result) != 'undefined' && result.length != 0 && result.password == pass) {
                    logs.info("username and password match database user");
                    logs.info("\n\n--------------------------------------------------");
                    logs.info("test PASSED :)");
                }
                else {
                    logs.info("\n\n--------------------------------------------------");
                    logs.info("test failed, due to incorrect username or password");
                }
            });
        });
    });

} catch (error) {
    logs.info("\n\n--------------------------------------------------");
    logs.error(error);
    logs.info("--------------------------------------------------");
    logs.info("test FG01 FAILED!! :( due to runtime error");

}