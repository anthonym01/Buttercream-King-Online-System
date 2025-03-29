//'node Server.js'
//This is the server file, it will handle all requests and responses

//Server configuration
const port = 8083;
const express = require('express');
const app = express();
const logs = require('./modules/logger');
const database = require('./modules/database_wrapper');

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
app.post('/get/cart', (req, res) => {
    try {
        logs.info('Get users cart');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);//expects { cakeid, quantity username };
            try {
                if (typeof (data) != 'undefined') {
                    // Get old cart data
                    database.getCustomersViaUsername(data).then((result) => {
                        const cartdata = JSON.parse(result.Cart_items) || [];
                        logs.info('Old cart data: ', cartdata, ' for user: ', data.username);
                        res.end(JSON.stringify(cartdata));
                    });

                }else{
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
                        console.log('Datatype: ',typeof(oldcart));
                        // Check if cake is already in cart
                        let existingItemindex = false;
                        for(let i = 0; i < oldcart.length; i++) {
                            if (oldcart[i].cakeid === data.cakeid) {
                                existingItemindex = i;
                                logs.info('Found existing item in cart: ', oldcart[i]);
                                break;
                            }
                        }
                        if (existingItemindex !== false) {
                            // Update quantity if cake is already in cart
                            oldcart[existingItemindex].quantity = Number(oldcart[existingItemindex].quantity) +Number(data.quantity);
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
                    if (typeof (result) != 'undefined' && result.password == data.pass) {
                        res.end(JSON.stringify({ status: "sucess" }));
                    }
                    else {
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

//Redirect to staff login
app.get('/staff', (req, res) => {
    try {
        logs.info('Redirecting to staff login');
        res.redirect('/testing/staff.html');
    } catch (error) {
        logs.error('Catastrophy on staff redirect: ', err);
    }
});