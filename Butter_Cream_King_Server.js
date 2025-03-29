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

//User login handler
app.post('/post/login', (req, res) => {
    /*This is a post request, it will be used to authenticate a user*/
    /* TO DO: impliment session key generation and storage later */
    try {
        logs.info('User login started');
        req.on('data', function (data) {
            data = JSON.parse(data);
            logs.info('got payload: ', data);
            database.getCustomersViaUsername(data.user).then((result) => {
                console.log('Lookup result: ', result);
                if (typeof(result)!='undefined' && result.password == data.pass) {
                    res.end(JSON.stringify({ status: "sucess" }));
                }
                else {
                    res.end(JSON.stringify({ status: "fail" }));
                }
            });
            //res.end(JSON.stringify({ status: "sucess" }));
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
            logs.error('got payload: ', data,' Despit not expecting any');
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