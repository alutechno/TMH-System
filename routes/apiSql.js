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
            //res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
            res.send({err:err,rows:rows,fields:fields})
        });
    });
    app.post('/query', function (req, res) {
		console.log(req.body)
		connection(req.body.query, req.body.values,function(err, rows, fields) {
            res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
        });
    });
    app.get('/datatable', function (req, res) {
        //Handle Request From Angular DataTables
        console.log('/datatable')
        console.log(req.query)
        //console.log(req.headers)

        var dtParam = req.query
        var where = '';
        /*if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' where name="'+req.query.customSearch + '" '
        }*/

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr =req.query.query

        console.log(sqlstr)
        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        console.log(dtParam)
                        res.send(dtParam)
                    }
                });
            }
        });


    });
    return app;
}
