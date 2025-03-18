const database = require('../modules/database_wrapper');
try {
    database.getCustomersViaUsername("test").then((result) => {
        //Convert to standard object
        let customer = result;
        customer.payment_details = JSON.parse(customer.payment_details);
        customer.Delivery_address = JSON.parse(customer.Delivery_address);
        customer.Cart_items = JSON.parse(customer.Cart_items);
        customer.orders = JSON.parse(customer.orders);
        console.log(customer);

    });
    //database.getCustomers();
    //database.getCakes();
    //database.getCustomersViaUuid(2);
    /*
    database.insert_into_Customers({
        username: "test",
        password: "test",
        loyalty_points: 0,
        payment_details: JSON.stringify([
            {
                ccv: 123,
                card_number: 1234567890123456,
                expiry_date: "2023-12-31",
                name_on_card: "test"
            }]),
        Delivery_address:JSON.stringify( [
            {
                line1: "test",
                line2: "address",
                city: "test",
                postcode: "test"
            }
        ]),
        Cart_items:JSON.stringify( [
            { cake_id: 1, quantity: 1 }, { cake_id: 2, quantity: 3 }
        ]),
        orders:JSON.stringify( [{ order_id: 1 }, { order_id: 2 }, { order_id: 3 }])
    });*/
    //database.updateCake(8, { Title: "Update test", Description: "test database update", image_uri: "t6apkmqamrne1.jpeg",price:1000000 });
    //database.getCakes()

    //database.getCakesViaUuid(6)

    //database.insert_into_Cakes({ Title: "Insertiton test", Description: "test database insertion", image_uri: "if-rapi-was-healed-and-discharged-w.png" });

    //database.getCakes();

} catch (error) {
    console.log("\n\n--------------------------------------------------");
    console.error(error);
    console.log("--------------------------------------------------");
    console.error("TEST FAILED!!");
}
