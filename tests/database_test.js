const database = require('../modules/database');

database.getInventory().then((results) => {
    console.info('Database retuned inventory to test: ', results);
})

/*
database.insert_into_Inventory({
    Title: "Insertiton test",
    Description: "test database insertion",
    image_uri: "if-rapi-was-healed-and-discharged-w.png",
    uuid: 7
});
*/