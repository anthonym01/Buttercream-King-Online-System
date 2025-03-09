//'node Server.js'
//This is the server file, it will handle all requests and responses

//Server configuration
const port = 8083;
const express = require('express');
const app = express();
const logs = require('./modules/logger');
const database = require('./modules/database');

app.listen(port, () => {
    try {
        logs.initalize();//initalize logger

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
}).on('error', (err) => { logs.error('Express JS error: ', err) }).on('listening', () => { logs.info('Express JS listening') }).on('connection', (socket) => { logs.info('Express JS connection', socket) }).on('request', (requests) => { logs.info('Express JS connection', requests) }).on('connect', (connectx) => { logs.info('Express JS connection', connectx) });

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
app.get('/get/catalog', (req, res) => {
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

//get bakerys catalog
app.get('/get/catalog', (req, res) => {
    try {
        logs.info('Connection ', req.hostname, 'requested catalog');
        req.on('data', function (data) {
            logs.info('got payload: ', data);
        });
        database.getInventory().then((results) => {
            logs.info('Database retuned inventory: ', results);
            res.end(JSON.stringify(results));
        })

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
            //find cake
            database.getInventory().then((results) => {
                logs.info('Database retuned inventory: ', results);
                //res.end(JSON.stringify(results));
                let found = false;
                for (let placeholder in results) {
                    if (cakeid == results[placeholder].uuid) {
                        logs.info('Found cake', cakeid);
                        res.end(JSON.stringify(results[placeholder]));
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    logs.info('Could not find cake', cakeid)
                    res.end(false);
                }
            })
        });
    } catch (error) {
        logs.error('Catastrophy on test post: ', err);
    }
});
