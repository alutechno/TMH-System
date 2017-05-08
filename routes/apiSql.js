var express = require('express');
module.exports = function(connection,jwt,log){
    var app = express.Router();

    app.use(function (req, res, next) {
        if (req.headers['authorization']){
            req.username = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
        }
        next();
    });

    app.get('/query', function (req, res) {
        log(req.headers,req.path,'query-request',JSON.stringify(req.query),JSON.stringify(req.body),'GET - Prepare query')
		connection(req.query.query, req.query.values,function(err, rows, fields) {
            if (!err){
                log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify({err:err,rows:rows,fields:fields}))
            }
            else {
                console.error(req.path+'|'+JSON.stringify(err))
            }

            //res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
            res.send({err:err,rows:rows,fields:fields})
        });
    });
    app.post('/query', function (req, res) {
		console.log(req.body.query)
		console.log(req.body.values)
        log(req.headers,req.path,'query-request',JSON.stringify(req.query),JSON.stringify(req.body),'POST - Prepare query')
		connection(req.body.query, req.body.values,function(err, rows, fields) {
            if (!err){
                log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify({err:err,rows:rows,fields:fields}))
            }
            else{
                console.error(req.path+'|'+JSON.stringify(err))
            }
            res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
        });
    });
    app.get('/datatable', function (req, res) {
        //Handle Request From Angular DataTables
        log(req.headers,req.path,'datatable-request',JSON.stringify(req.query),JSON.stringify(req.body),'GET - Prepare query')
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
        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(dtParam))
                        res.send(dtParam)
                    }
                });
            }
            else{
                console.error(req.path+'|'+JSON.stringify(err))
            }
        });


    });
    app.post('/datatable', function (req, res) {
        //Handle Request From Angular DataTables
        log(req.headers,req.path,'datatable-request',JSON.stringify(req.query),JSON.stringify(req.body),'GET - Prepare query')
        //console.log(req.headers)

        var dtParam = req.query
        var where = '';
        /*if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' where name="'+req.query.customSearch + '" '
        }*/

        var limit = ' limit '+req.body.start+','+req.body.length
        var order = '';
        order = ' order by ' +req.body.columns[req.body.order[0].column].data +' '+ req.body.order[0].dir

        var sqlstr =req.body.query
console.log(sqlstr)
        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(dtParam))
                        res.send(dtParam)
                    } else {
                        console.error(req.path+'|'+JSON.stringify(err));
                        res.send({
                            query: sqlstr + order + limit,
                            error: err2.message
                        })
                    }
                });
            }
            else{
                console.error(req.path+'|'+JSON.stringify(err));
                res.send({
                    query: sqlstr + order + limit,
                    error: err.message
                })
            }
        });


    });


    return app;
}
