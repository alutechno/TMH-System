var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var mysql      = require('mysql');

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

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'media',
  port: 8889
});

connection.connect();

var apiRoutes = require('./routes/api')(connection,jwt);
var apiFoRoutes = require('./routes/apifo')(connection,jwt);
app.use('/api', apiRoutes);
app.use('/apifo', apiFoRoutes);

//connection.end();

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/testProc', function (req, res) {
    var procName = req.query.proc
    var paramR = []
    var paramL = []
    if (req.query.param.length>0){
        for(var i=0;i<req.query.param.split(',').length;i++){
            paramR.push(req.query.param.split(',')[i])
            paramL.push('?')
        }
    }
    var command = 'call '+procName+'('+paramL.toString()+')'
    connection.query(command, paramR,function(err, result) {
        if (err) res.send(err)
        else res.send(result)
    });
});

app.post('/authorize', function (req, res) {
    /*
     NOTES:
        authorize body is:
        authorize: {MODUL: {menu: [depends on menu mangement item]}}
        if boolean, identic to button or a link
        if query string, identic to tabular view or chart
        access view form is auto added when menu attach to user,
        read value can have default value or read from query string
    */
    console.log(req.body);
    var user_a = {
        isAuthenticated: true,
        name: 'user_a',
        fullName: 'User A',
        roles: ['admin'],
        defaultPage: 'app.dashboard',//Home button read from this key
        authorize: {
            Global: {
                dashboard: {
                    sales: 'select * from master_sales',

                }
            },
            FO: {
                nightAudit: {
                    create: true,
                    update: false,
                    delete: false,
                    changeDate: true,
                    read: 'select * from table'
                }
            },
            BO: {
                purchasing: {
                    create: true,
                    update: true,
                    delete: true,
                    approvalDeptHead: true
                }
            }
        }
    }
    res.send(user_a);

});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
