const database = require('../modules/database');
try {
    
} catch (error) {
    console.log("\n\n--------------------------------------------------");
    console.error("TEST FAILED!!", error);
}

//database.getCakes()

database.getCakesViaUuid(6)

/*database.insert_into_Cakes({
    Title: "Insertiton test",
    Description: "test database insertion",
    image_uri: "if-rapi-was-healed-and-discharged-w.png"
});*/

//database.getInventory();