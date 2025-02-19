//'node Server.js'
//This is the server file, it will handle all requests and responses

//Server configuration
const port = 8083;// 80, 443, 8083 nginx
const express = require('express');
const app = express();
const logs = require('./modules/logger');

app.listen(port, () => {
    try {
        logs.initalize();//initalize logger
        logs.info('Server starting');//log server start
        logs.info('Running on port ', port);
        logs.info('Process ID: ', process.pid);
        logs.info('Process path: ', process.cwd());
    } catch (error) {
        logs.error('Catastrophy on server start: ', error);
    }
})//Listen for requests, this starts the server

//bind root path to /www folder
app.use(express.static('www')).listen(() => {
    logs.info('serving static files from ', __dirname+'/www');
}).on('error', (err) => {
    logs.error('Express JS error: ', err);
}).on('listening', () => {
    logs.info('Express JS listening');
}).on('connection', (socket) => {
    logs.info('Express JS connection', socket);
}).on('request', (requests) => {
    logs.info('Express JS connection', requests);
}).on('connect', (connectx) => {
    logs.info('Express JS connection', connectx);
});
    
;

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
        logs.info('Connection ',req,'requested catalog');
        req.on('data', function (data) {
            logs.info('got payload: ', data);
            //res.end(JSON.stringify({ testget: "test get data received" }));
        });
        
        //pull catalog from sql location

        res.send(JSON.stringify([{ placeholder: 'catalog under construction' }]));
    } catch (error) {
        logs.error('Catastrophy catalog conveyor: ', err);
    }
});