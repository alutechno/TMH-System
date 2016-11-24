var express = require('express');
var app = express();
var bodyParser = require('body-parser');

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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
