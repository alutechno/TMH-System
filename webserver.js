var express = require('express');
var cluster = require('cluster');
var app = express();
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: __dirname+'/webapp/container/img/tmp/'})

if (cluster.isMaster) {
    for (var i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
}
else {
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    app.use(bodyParser.json()); // support json encoded bodies
    app.use('/assets', express.static(__dirname + '/webapp/assets'));
    app.use('/pages', express.static(__dirname + '/webapp/pages'));
    app.use('/container', express.static(__dirname + '/webapp/container'));
    app.use('/template', express.static(__dirname + '/webapp/template'));
    app.set('views', __dirname + '/webapp' );
    app.set('view engine', 'ejs');

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.post('/upload', upload.single('image'), function (req, res, next) {
        var retval = req.file;
        retval['pth'] = 'container/img/tmp/'+req.file.filename
        res.send(retval)
    });

    app.listen(3000, function () {
      console.log('Example app listening on port 3000!');
    });
}
