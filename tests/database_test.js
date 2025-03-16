const database = require('../modules/database_wrapper');
try {

} catch (error) {
    console.log("\n\n--------------------------------------------------");
    console.error("TEST FAILED!!", error);
}

//database.updateCake(8, { Title: "Update test", Description: "test database update", image_uri: "t6apkmqamrne1.jpeg",price:1000000 });
//database.getCakes()

//database.getCakesViaUuid(6)

//database.insert_into_Cakes({ Title: "Insertiton test", Description: "test database insertion", image_uri: "if-rapi-was-healed-and-discharged-w.png" });

//database.getInventory();