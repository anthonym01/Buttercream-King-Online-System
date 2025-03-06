const database = require('../modules/database');

database.getInventory().then((results) => {
    console.info('Database retuned inventory to test: ', results);
})