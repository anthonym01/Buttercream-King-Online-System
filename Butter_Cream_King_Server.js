//'node Server.js'
//This is the server file, it will handle all requests and responses

//Server configuration
const port = 8083;
const path = require('path');
//const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
//const bodyParser = require('body-parser');
const app = express();
app.use(fileUpload());//allow file uploads via formData
const logs = require('./modules/logger');
const database = require('./modules/database_wrapper');
const { log } = require('console');

app.listen(port, () => {
    try {
        logs.initalize();//initalize logger
        //logs.info('Subpath sample ',subpath+'/get/catalog');
        logs.info('Server starting');//log server start
        logs.info('Running on port ', port);
        logs.info('Process ID: ', process.pid);
        logs.info('Process path: ', process.cwd());
        //connection.connect();
    } catch (error) {
        logs.error('Catastrophy on server start: ', error);
    }
})//Listen for requests, this starts the server

//bind root path to /www folder
app.use(express.static('www')).listen(() => {
    logs.info('serving static files from ', __dirname + '/www');
}).on('error', (err) => { logs.error('Express JS error: ', err) }).on('listening', () => { logs.info('Express JS listening') }).on('connection', (socket) => { logs.info('Express JS connection', socket) });

//Template post handler
app.post('/post/template', (req, res) => {
    try {
        logs.info('Post template');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            res.end(JSON.stringify({ answer: "post template" }));
            //find cake
        });
    } catch (error) {
        logs.error('Catastrophy on template post: ', err);
    }
});

//Template get handler
app.get('/get/template', (req, res) => {
    try {
        logs.info('Get template');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            res.end(JSON.stringify({ answer: "get template" }));
        });
    } catch (error) {
        logs.error('Catastrophy template get: ', err);
    }
});

// Get cart handler
//This will get the users cart, and return it as a json object
app.post('/get/cart', (req, res) => {
    try {
        logs.info('Get users cart');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects username;
            try {
                if (typeof (data) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data).then((result) => {
                        const cartdata = JSON.parse(result.Cart_items) || [];
                        logs.info('Old cart data: ', cartdata, ' for user: ', data);
                        res.end(JSON.stringify(cartdata));
                    });

                } else {
                    logs.error('No username provided in get cart request: ', data);
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on Get cart: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on Get cart: ', err);
    }
});

//Add to cart handler
//This will add a cake to the cart, or update the quantity if it already exists
app.post('/post/addtocart', (req, res) => {
    try {
        logs.info('Add to cart');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { cakeid, quantity username };
            try {
                if (typeof (data.cakeid) != 'undefined' && typeof (data.quantity) != 'undefined' && typeof (data.username) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data.username).then((result) => {
                        let oldcart = JSON.parse(result.Cart_items) || [];
                        logs.info('Old cart data: ', oldcart, ' for user: ', data.username);
                        console.log('Datatype: ', typeof (oldcart));
                        // Check if cake is already in cart
                        let existingItemindex = false;
                        for (let i = 0; i < oldcart.length; i++) {
                            if (oldcart[i].cakeid === data.cakeid) {
                                existingItemindex = i;
                                logs.info('Found existing item in cart: ', oldcart[i]);
                                break;
                            }
                        }
                        if (existingItemindex !== false) {
                            // Update quantity if cake is already in cart
                            oldcart[existingItemindex].quantity = Number(oldcart[existingItemindex].quantity) + Number(data.quantity);
                            logs.info('Updated existing item: ', oldcart[existingItemindex]);
                        } else {
                            // Add new item to cart
                            logs.info('Adding new item to cart: ', data);
                            oldcart.push({ cakeid: data.cakeid, quantity: data.quantity });
                            logs.info('New cart data: ', oldcart);
                        }
                        // Update the cart in the database
                        database.updateCustomer(data.username, { Cart_items: JSON.stringify(oldcart) });
                        logs.info('Updated cart: ', result);
                        res.end(JSON.stringify({ status: "success" }));
                    });

                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

//Remove from cart handler


//force update cart items handler
//This will remove a cake from the cart, or update the quantity if it already exists for a specific user
app.post('/post/updatecartitems', (req, res) => {
    logs.info('Update cart items, change quantity manual override');
    try {
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { cakeid, quantity, username };

            //get old cart data
            database.getCustomersViaUsername(data.username).then((result) => {
                let oldcart = JSON.parse(result.Cart_items) || [];//get old cart data
                logs.info('Old cart data: ', oldcart, ' for user: ', data.username);
                console.log('Datatype: ', typeof (oldcart));
                // Check if cake is already in cart
                let existingItemindex = false;
                for (let i = 0; i < oldcart.length; i++) {
                    if (oldcart[i].cakeid === data.cakeid) {
                        existingItemindex = i;
                        logs.info('Found existing item in cart: ', oldcart[i]);
                        break;
                    }
                }
                if (existingItemindex !== false) {
                    // Update quantity if cake is already in cart
                    oldcart[existingItemindex].quantity = Number(data.quantity);
                    logs.info('Updated existing item: ', oldcart[existingItemindex]);
                } else {
                    // Add new item to cart
                    logs.info('Adding new item to cart: ', data);
                    oldcart.push({ cakeid: data.cakeid, quantity: data.quantity });
                    logs.info('New cart data: ', oldcart);
                }
                // Update the cart in the database
                database.updateCustomer(data.username, { Cart_items: JSON.stringify(oldcart) });
                logs.info('Updated cart: ', result);
                res.end(JSON.stringify({ status: "success" }));
            });
        });
    } catch (error) {
        logs.error('Catastrophy on update cart items: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }
});


//get/checkoutdata handler
//This will get the users checkout data, and return it as a json object, specifically the address and payment method
app.post('/get/checkoutdata', (req, res) => {
    try {
        logs.info('Post template');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//quick checkout data, expects username ;
            database.getCustomersViaUsername(data).then((result) => {
                logs.info('Checkout data for : ', result);
                if (typeof (result) != 'undefined') {
                    res.end(JSON.stringify({ deliveryinfo: result.Delivery_address, paymentinfo: result.payment_details }));
                } else {
                    res.end(JSON.stringify({ status: "error" }));
                }
            });//find cake
        });
    } catch (error) {
        logs.error('Catastrophy on template post: ', err);
        res.end(JSON.stringify({ status: "error" }));
    }
});

//Add delivery address handler
//This will add a delivery address to the users account
app.post('/post/adddeliveryaddress', (req, res) => {
    try {
        logs.info('Add delivery address');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { address, username };
            try {
                if (typeof (data.Delivery_address) != 'undefined' && typeof (data.username) != 'undefined') {
                    database.updateCustomer(data.username, { Delivery_address: JSON.stringify({ address: data.Delivery_address }) });
                    logs.info('Updated delivery address: ', data.address, ' for user: ', data.username);
                    res.end(JSON.stringify({ status: "success" }));
                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

// Add payment method handler
app.post('/post/addpaymentmethod', (req, res) => {
    try {
        logs.info('Add payment method');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { card, username };
            try {
                if (typeof (data.card) != 'undefined' && typeof (data.username) != 'undefined') {
                    database.updateCustomer(data.username, { payment_details: JSON.stringify(data.card) });
                    logs.info('Updated payment method: ', data.card, ' for user: ', data.username);
                    res.end(JSON.stringify({ status: "success" }));
                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

//User login handler
app.post('/post/login', (req, res) => {
    /*This is a post request, it will be used to authenticate a user*/
    /* TO DO: impliment session key generation and storage later */
    try {
        logs.info('User login started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            try {
                database.getCustomersViaUsername(data.user).then((result) => {
                    logs.info('Lookup result: ', result);
                    if (typeof (result) != 'undefined' && result.length != 0 && result.password == data.pass) {
                        res.end(JSON.stringify({ status: "sucess" }));
                    }
                    else {
                        logs.info('User does not exist or password is incorrect: ', data.user);
                        res.end(JSON.stringify({ status: "fail" }));
                    }
                });
            } catch (error) {
                logs.error('Catastrophy on login post: ', error);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on login post: ', err);
    }
});

//User registration handler
app.post('/post/signup', (req, res) => {
    /*This is a post request, it will be used to register a user*/
    try {
        logs.info('User signup started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);// { user, pass };

            try {
                if (typeof (data.user) != 'undefined' && typeof (data.pass) != 'undefined') {
                    database.getCustomersViaUsername(data.user).then((result) => {
                        if (typeof (result) == 'undefined' || result.length == 0) {
                            logs.info('User does not exist, creating new user: ', data.user);
                            // Create new user
                            const newUser = {
                                username: data.user,
                                password: data.pass,
                                Cart_items: JSON.stringify([]),
                                orders: JSON.stringify([]),
                                Delivery_address: JSON.stringify({}),
                                payment_details: JSON.stringify({}),
                                loyalty_points: 0,
                            }
                            //Insert new user into database
                            database.insert_into_Customers(newUser).then((result) => {
                                logs.info('User created: ', result);
                            });
                            res.end(JSON.stringify({ status: "success" }));
                        } else {
                            res.end(JSON.stringify({ status: "exists" }));
                        }
                    });
                } else {
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on signup post: ', error);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on signup post: ', err);
    }
});

//get bakerys catalog
app.get('/get/catalog', (req, res) => {
    try {
        logs.info('Connection ', req.hostname, 'requested catalog');
        req.on('data', function (data) {
            logs.error('got payload: ', data, ' Despit not expecting any');
        });
        database.getCakes().then((results) => {
            logs.info('Database retuned inventory: ', results);
            res.end(JSON.stringify(results));
        });

    } catch (error) {
        logs.error('Catastrophy catalog conveyor: ', err);
    }
});

//submit order handler
//This will submit an order to the database, and update the users orders
app.post('/post/submitorder', (req, res) => {
    console.log('Submit order');
    try {
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//{ username, Items: [{cakeid:#,quantity:#}], Status,total_price: float,Date: ISOString };
            try {
                const order = {
                    Items: JSON.stringify(data.Items),
                    Status: data.Status,
                    total_price: Number(data.total_price),
                    Date: new Date()//data.Date
                }
                if (typeof (data.username) != 'undefined') {
                    database.insert_into_Orders(order).then((result) => {
                        logs.info('Order submitted: ', result);

                        const orderid = result.insertId;
                        //Update the Customer with the order id
                        database.getCustomersViaUsername(data.username).then((result) => {
                            let old_order_data = JSON.parse(result.orders) || [];
                            logs.info('Old order data: ', old_order_data, ' for user: ', data.username);
                            console.log('Datatype: ', typeof (old_order_data));

                            logs.info('Adding new order to user: ', old_order_data);
                            old_order_data.push(orderid);
                            logs.info('New orders data: ', old_order_data);

                            // Update the cart in the database
                            database.updateCustomer(data.username, { orders: JSON.stringify(old_order_data), Cart_items: JSON.stringify([]) });
                            // Clear the cart after order is submitted
                            logs.info('Updated user orders: ', old_order_data);
                            res.end(JSON.stringify({ status: "success" }));

                            // update loyalty points
                            let loyaltypoints = Math.floor(data.total_price / 100);
                            logs.info('Adding loyalty points: ', loyaltypoints, ' for user: ', data.username);
                            database.updateCustomer(data.username, { loyalty_points: Number(result.loyalty_points) + Number(loyaltypoints) });
                        });
                        res.end(JSON.stringify({ status: "success" }));
                    });
                }
            } catch (error) {
                logs.error('Catastrophy on add to cart post: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on add to cart: ', err);
    }
});

//get orders for a user
//This will get the users orders, and return it as a json object
app.post('/get/orders', (req, res) => {
    try {
        logs.info('Get users orders');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects username;
            try {
                if (typeof (data) != 'undefined') {
                    // Get old order data
                    database.getCustomersViaUsername(data).then((result) => {
                        const orderdata = JSON.parse(result.orders) || [];
                        logs.info('order data: ', orderdata, ' for user: ', data);
                        console.log('Datatype: ', typeof (orderdata));
                        // Translate order ids to order objects
                        let orders = [];//Array to hold promised orders
                        for (let i = 0; i < orderdata.length; i++) {
                            orders.push(database.getOrdersViaUuid(orderdata[i]));
                        }
                        // Wait for all orders to be retrieved
                        logs.info('Waiting for all orders to be retrieved: ', orders);
                        // Use Promise.all to wait for all promises to resolve
                        Promise.all(orders).then((results) => {
                            logs.info('All orders retrieved: ', results);
                            // Filter out orders that are not in the database
                            let filteredOrders = results.filter((order) => {
                                return order != undefined && order != null;
                            });
                            logs.info('Filtered orders: ', filteredOrders);
                            res.end(JSON.stringify(filteredOrders));
                        }).catch((error) => {
                            logs.error('Error retrieving orders: ', error);
                            res.end(JSON.stringify({ status: "error" }));
                        });
                    });

                } else {
                    logs.error('No username provided in get orders request: ', data);
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on Get orders: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on Get orders: ', err);
    }
});

app.get('/get/ordersall', (req, res) => {
    try {
        logs.info('Get all orders');
        database.getOrders().then((result) => {
            res.end(JSON.stringify(result));
        });

    } catch (error) {
        logs.error('Catastrophy on get all orders: ', err);
        res.end(JSON.stringify({ status: "error" }));
    }
});

app.post('/get/orderbyid', (req, res) => {
    try {
        req.on('data', function (data) {
            const orderid = Number(JSON.parse(data));//expects id
            logs.info('got id to find : ', orderid);
            database.getOrdersViaUuid(orderid).then((result) => {
                res.end(JSON.stringify(result));
            });
        });
    } catch (error) {
        logs.error('Catastrophy on get order by id: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }
});

// find a cake by its uuid
app.post('/get/cakebyuuid', (req, res) => {
    try {
        logs.info('search cake');
        req.on('data', function (data) {
            const cakeid = JSON.parse(data);
            logs.info('got id to find : ', cakeid);
            database.getCakesViaUuid(cakeid).then((result) => {
                res.end(JSON.stringify(result));
            })
        });
    } catch (error) {
        logs.error('Catastrophy on test post: ', err);
    }
});

app.post('/get/loyaltypoints', (req, res) => {
    try {
        logs.info('Get loyalty points');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects username;
            try {
                if (typeof (data) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data).then((result) => {
                        const loyaltypoints = Number(result.loyalty_points) || 0;
                        logs.info('Loyalty points: ', loyaltypoints, ' for user: ', data);
                        res.end(JSON.stringify({ loyaltypoints: loyaltypoints }));
                    });

                } else {
                    logs.error('No username provided in get cart request: ', data);
                    res.end(JSON.stringify({ status: "error" }));
                }
            } catch (error) {
                logs.error('Catastrophy on Get cart: ', error, data);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on Get cart: ', err);
    }
});

//Redirect to staff login
app.get('/staff', (req, res) => {
    try {
        logs.info('Redirecting to staff login');
        res.redirect('staff.html');
    } catch (error) {
        logs.error('Catastrophy on staff redirect: ', err);
    }
});

//Get staff login
app.post('/get/stafflogin', (req, res) => {
    try {
        logs.info('User login started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            try {
                database.getStaffViaUsername(data.user).then((result) => {
                    logs.info('Lookup result: ', result);
                    if (typeof (result) != 'undefined' && result.length != 0 && result.password == data.pass) {
                        res.end(JSON.stringify({ status: "sucess", privilage: result.privilage_level }));
                    }
                    else {
                        logs.info('User does not exist or password is incorrect: ', data.user);
                        res.end(JSON.stringify({ status: "fail" }));
                    }
                });
            } catch (error) {
                logs.error('Catastrophy on login post: ', error);
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    } catch (error) {
        logs.error('Catastrophy on login post: ', err);
    }
})

app.post('/post/uploadcakedata', (req, res) => {
    try {
        console.log('Upload cake data');
        console.log(req.body);// expects: { title,description, price }

        const cake = {
            Title: req.body.title,
            Description: req.body.description || 'empty',
            price: req.body.price,
            image_uri: '',//fix no default image uri later
        }

        if (!req.files || req.files.length == 0 || req.files == null) {
            //No files submitted, handle condition
            console.log('No files submitted');
            //create cake with no image
            console.log('Creating new cake');
            database.insert_into_Cakes(cake).then((result) => {
                logs.info('Cake created: ', result);

                res.end(JSON.stringify({ status: "success" }));
            });
        } else {
            //Check if files are submitted
            console.log('Files submitted: ', req.files);
            //Check if image is too big
            //if (image_file.size > 1000000) return res.sendStatus(400);
            //Create a new cake object

            const { image_file } = req.files;
            console.log('Creating new cake with image: ', image_file.name);
            database.insert_into_Cakes(cake).then((result) => {
                logs.info('Cake created: ', result);

                //move and rename the image file to the cakes id
                const cakeid = result.insertId;
                const imagename = `${String(cakeid)}${path.extname(image_file.name)}`;
                console.log('Image name: ', imagename);
                image_file.mv(path.join(__dirname, 'www/img_database_store/cakes', imagename));

                database.updateCake(cakeid, { image_uri: imagename });//database needs to know the image name to display it later
                logs.info('Updated cake image: ', imagename, ' for cake: ', cakeid);
                res.end(JSON.stringify({ status: "success" }));
            });
        }

    } catch (error) {
        logs.error('Catastrophy on upload cake data: ', error);
        res.end(JSON.stringify({ status: "failiure critical error" }));
    }
});

app.post('/post/editcake', (req, res) => {
    logs.info('Edit cake data');
    try {

        console.log(req.body);// expects: { title, description, price, uuid }
        console.log(req.files);// expects: { image_file }

        const uuid = req.body.uuid;

        if (typeof (uuid) == 'undefined') {
            logs.error('No uuid provided in edit cake request: ', req.body);
            res.end(JSON.stringify({ status: "error" }));
            return;
        }

        const cake = {
            Title: req.body.title,
            Description: req.body.description || 'empty',
            price: req.body.price,
            image_uri: '',//fix no default image uri later
        }

        if (!req.files || req.files.length == 0 || req.files == null) {
            //No files submitted, handle condition
            console.log('No files submitted, assuming intent');
            //create cake with no image
            database.updateCake(uuid, cake);
            res.end(JSON.stringify({ status: "success" }));
        } else {
            //Check if files are submitted
            console.log('Files submitted: ', req.files);
            //Check if image is too big
            //if (image_file.size > 1000000) return res.sendStatus(400);
            //Create a new cake object

            const { image_file } = req.files;
            console.log('Update cake with image: ', image_file.name);

            const imagename = `${String(uuid)}${path.extname(image_file.name)}`;
            console.log('Image name: ', imagename);
            image_file.mv(path.join(__dirname, 'www/img_database_store/cakes', imagename));
            cake.image_uri = imagename;//update the image name in the cake object
            database.updateCake(uuid, cake);//update the cake in the database
            logs.info('Updated cake image: ', imagename, ' for cake: ', uuid);
            res.end(JSON.stringify({ status: "success" }));
        }

    } catch (error) {
        logs.error('Catastrophy on edit cake data: ', error);
        res.end(JSON.stringify({ status: "failiure critical error" }));
    }
});

app.post('/post/deletecake', (req, res) => {
    console.log('Delete cake data');
    try {
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);// expects: { uuid }

            const uuid = data;
            if (typeof (uuid) == 'undefined') {
                logs.error('No uuid provided in delete cake request: ', data);
                res.end(JSON.stringify({ status: "error" }));
                return;
            }

            database.deleteCake(uuid);
            res.end(JSON.stringify({ status: "success" }));
        });
    } catch (error) {
        logs.error('Catastrophy on delete cake data: ', error);
        res.end(JSON.stringify({ status: "failiure critical error" }));
    }
});

// get all staff mambers for display
app.get('/get/staff', (req, res) => {
    try {
        logs.info('Get all staff members');
        database.getStaff().then((result) => {
            res.end(JSON.stringify(result));
        });
    } catch (error) {
        logs.error('Catastrophy on get staff: ', err);
        res.end(JSON.stringify({ status: "error" }));
    }
})

app.post('/post/staffupdate', (req, res) => {
    logs.info('staff update');

    try {

        req.on('data', function (data) {
            const staff = JSON.parse(data);
            logs.info('got payload: ', staff);// expects: {id,            username, password,privilage_level}
            if (typeof (staff) == 'undefined') {
                logs.error('No staff data provided in request: ', data);
                res.end(JSON.stringify({ status: "error" }));
                return;
            }

            const stripped_staff = {
                username: staff.username,
                password: staff.password,
                privilage_level: staff.privilage_level
            }

            //check if id is provided
            if (staff.id == 0 || staff.id == '0') {
                //create new staff member
                database.insert_into_Staff(stripped_staff);
                logs.info('Staff created: ', stripped_staff);
                res.end(JSON.stringify({ status: "success" }));
            }
            else {
                //update staff member
                database.updateStaff(Number(staff.id), stripped_staff);
                logs.info('Updated staff: ', staff);
                res.end(JSON.stringify({ status: "edited" }));
            }

        });
    } catch (error) {
        logs.error('Catastrophy on staff update: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }
});

app.post('/get/staffbyid', (req, res) => {
    try {
        req.on('data', function (data) {
            const staffid = Number(JSON.parse(data));//expects id
            logs.info('got id to find : ', staffid);
            database.getStaffViaUuid(staffid).then((result) => {
                res.end(JSON.stringify(result));
            })
        });
    } catch (error) {
        logs.error('Catastrophy on get staff by id: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }
});

app.post('/post/deletestaff', (req, res) => {
    console.log('Delete staff data');
    try {
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);// expects:  uuid 

            const uuid = data;
            if (typeof (uuid) == 'undefined') {
                logs.error('No uuid provided in delete staff request: ', data);
                res.end(JSON.stringify({ status: "error" }));
                return;
            }

            database.deleteStaff(uuid);
            res.end(JSON.stringify({ status: "success" }));
        });
    } catch (error) {
        logs.error('Catastrophy on delete staff data: ', error);
        res.end(JSON.stringify({ status: "failiure critical error" }));
    }
});

//get/customers get all customers for display
app.get('/get/customers', (req, res) => {
    try {
        logs.info('Get all customers');
        database.getCustomers().then((result) => {
            res.end(JSON.stringify(result));
        });
    } catch (error) {
        logs.error('Catastrophy on get customers: ', err);
        res.end(JSON.stringify({ status: "error" }));
    }
})

app.post('/get/customerbyid', (req, res) => {
    try {
        req.on('data', function (data) {
            const customerid = Number(JSON.parse(data));//expects id
            logs.info('got id to find : ', customerid);
            database.getCustomersViaUuid(customerid).then((result) => {
                res.end(JSON.stringify(result));
            })
        });
    } catch (error) {
        logs.error('Catastrophy on get customer by id: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }
});

app.post('/post/updateorderstatus', (req, res) => {
    logs.info('Update order status');
    try {
        req.on('data', function (data) {

            const order_data = JSON.parse(data);
            logs.info('got payload: ', order_data);// expects: { orderid, status }
            if (typeof (order_data) == 'undefined') {
                logs.error('No order data provided in request: ', data);
                res.end(JSON.stringify({ status: "error" }));
                return;
            }
            //update by id
            const stripped_order = {
                Status: order_data.status,
            }
            //check if id is provided
            if (order_data.orderid == 0 || order_data.orderid == '0') {
                logs.error('No order id provided in request: ', data);
                res.end(JSON.stringify({ status: "error" }));
                return;
            }
            //update order status
            database.updateOrder(Number(order_data.orderid), stripped_order);
            logs.info('Updated order: ', order_data.orderid, ' to status: ', order_data.status);
            res.end(JSON.stringify({ status: "success" }));

        });
    } catch (error) {
        logs.error('Catastrophy on update order status: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }

});

app.post('/post/cancelorder', (req, res) => {
    try {
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('Cancel order request: ', data);// expects: { ordernumber, username }
            if (typeof (data) == 'undefined') {
                logs.error('No order data provided in request: ', data);
                res.end(JSON.stringify({ status: "error" }));
                return;
            }
            //update by id
            const stripped_order = {
                Status: 'Cancelled',
            }
            database.updateOrder(Number(data.ordernumber), stripped_order);
            logs.info('Updated order: ', data.ordernumber, ' to status: Cancelled for user', data.username);
            res.end(JSON.stringify({ status: "success" }));
        });
    } catch (error) {
        logs.error('Catastrophy on cancel order: ', error);
        res.end(JSON.stringify({ status: "error" }));
    }
});