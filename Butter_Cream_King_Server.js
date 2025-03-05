//'node Server.js'
//This is the server file, it will handle all requests and responses
const placeholder_database = [
    {
        title: "Chocolate",
        description: "Classic chocolate layer cake with chocolate icecream",
        image_uri: '1.jpg',
        uuid: '001',
    },
    {
        title: "cookies and cream",
        description: "Description of cake 2 for testing",
        image_uri: '2.jpg',
        uuid: '002',
    },
    {
        title: "name",
        description: "Description of cake 3 for testing",
        image_uri: '3.jpg',
        uuid: '003',
    },
    {
        title: "strawberry",
        description: "yummy yummy strawberry cake",
        image_uri: '4.jpg',
        uuid: '004',
    },
    {
        title: "rainbow layer cake",
        description: "rainbow flavoured layer cake",
        image_uri: '5.jpg',
        uuid: '005',
    },
    {
        title: "super strawberry",
        description: "heart shaped strawberry cake",
        image_uri: '6.jpg',
        uuid: '006',
    },
];

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

app.get('/get/test', (req, res) => {//test get
    try {
        logs.info('test get');
        req.on('data', function (data) {
            logs.info('got: ', data);
            res.end(JSON.stringify({ testget: "test get data received" }));
        });
        //res.writeHead(200, { 'Content-type': 'application/json' });
        res.send(JSON.stringify({ test: 'test get is okay' }));
    } catch (error) {
        logs.error('Catastrophy on test get: ', err);
    }
});

app.post('/post/test', (req, res) => {//test post
    //receive more data than a get
    try {
        logs.info('test post to server');
        req.on('data', function (data) {
            logs.info('Posted : ', JSON.parse(data));
            res.end(JSON.stringify({ test: "test post received" }));
        });
    } catch (error) {
        logs.error('Catastrophy on test post: ', err);
    }
});

app.get('/get/catalog', (req, res) => {//get bakerys catalog
    try {
        logs.info('Connection ', req.hostname, 'requested catalog');
        req.on('data', function (data) {
            logs.info('got payload: ', data);
            //res.end(JSON.stringify({ testget: "test get data received" }));
        });

        //pull catalog from maria sql database location
        res.end(JSON.stringify(placeholder_database));

    } catch (error) {
        logs.error('Catastrophy catalog conveyor: ', err);
    }
});