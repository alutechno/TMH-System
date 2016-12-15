var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        if (req.headers['authorization']){
            req.username = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
        }
        next();
    });

    app.get('/query', function (req, res) {
		connection(req.query.query, req.query.values,function(err, rows, fields) {
            res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
        });
    });
	app.post('/query', function (req, res) {
		console.log(req.body)
		connection(req.body.query, req.body.values,function(err, rows, fields) {
            res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
        });
    });
    return app;
}
