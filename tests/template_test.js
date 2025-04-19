const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');

try {
    logs.info("Starting template test");
    // Example of a test case
    database.getCustomers().then((result) => {
        logs.info("Result: ", result);
    });
    logs.info("--------------------------------------------------");
    logs.info("--TEST PASSED-- :)");
} catch (error) {
    logs.info("\n\n--------------------------------------------------");
    logs.error(error);
    logs.info("--------------------------------------------------");
    logs.info("TEST FAILED!! :(");

}