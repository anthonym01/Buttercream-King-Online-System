const database = require('../modules/database_wrapper');
const logs = require('../modules/logger');

try {
    logs.info("Starting test FG01");
    
    logs.info("--------------------------------------------------");
    logs.info(" test FG01 -PASSED- :)");
} catch (error) {
    logs.info("\n\n--------------------------------------------------");
    logs.error(error);
    logs.info("--------------------------------------------------");
    logs.info("test FG01 FAILED!! :(");

}