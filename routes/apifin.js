var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        if (req.headers['authorization']){
            req.username = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
        }
        next();
    });

    app.get('/test', function (req, res) {
        res.send('API Finance, access user is:'+JSON.stringify(req.username))
    });

    app.get('/getAccountTypes', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' where name="'+req.query.customSearch + '" '
        }



        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select id,name,code,description,status '+
            ' from ref_ledger_account_type '+where

        console.log(sqlstr)

        connection.query('select count(1) as cnt from('+sqlstr+') a', function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection.query(sqlstr + order + limit, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getAccountType', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,name,code,description,status '+
            ' from ref_ledger_account_type '+where
        connection.query(sqlstr, function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createAccountType', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_ledger_account_type SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
            console.log(err)
            console.log(result)
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/updateAccountType', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_ledger_account_type SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }


        connection.query(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteAccountType', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_ledger_account_type where id='+req.body.id
        console.log(sqlstr)

        connection.query(sqlstr,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });


    return app;

}
