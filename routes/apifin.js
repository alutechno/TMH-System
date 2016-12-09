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

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
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
        connection(sqlstr, undefined,function(err, rows, fields) {
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

        connection(sqlstr, sqlparam,function(err, result) {
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


        connection(sqlstr, sqlparam,function(err, result) {
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

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getDepartments', function (req, res) {
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

        var sqlstr = 'select id,code,name,short_name,description,status '+
            ' from mst_department '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getDepartment', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,code,name,short_name,description,status '+
            ' from mst_department '+where
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createDepartment', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_department SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateDepartment', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_department SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteDepartment', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_department where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getCcTypes', function (req, res) {
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

        var sqlstr = 'select id,code,name,description,status '+
            ' from ref_cost_center_type '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getCcType', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,code,name,description,status '+
            ' from ref_cost_center_type '+where
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createCcType', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_cost_center_type SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateCcType', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_cost_center_type SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteCcType', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_cost_center_type where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getCostCenters', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name="'+req.query.customSearch + '" '
        }



        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id,a.code,a.name,a.description,a.status,a.category_id,b.name as category_name '+
            'from mst_cost_center a, ref_cost_center_type b '+
            'where a.category_id = b.id '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getCostCenter', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select a.id,a.code,a.name,a.description,a.status,a.category_id,b.name as category_name '+
            'from mst_cost_center a, ref_cost_center_type b '+
            'where a.category_id = b.id '+where
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createCostCenter', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_cost_center SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            category_id: req.body.category_id
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateCostCenter', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_cost_center SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            category_id: req.body.category_id
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteCostCenter', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_cost_center where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getCoas', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' and id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name="'+req.query.customSearch + '" '
        }



        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id, a.code, a.name, a.short_name, a.description, a.status, a.account_type_id, d.name as account_type_name, '+
              'a.report_level, a.dept_id, b.name as dept_name, a.cost_center_id, c.name as cost_center_name '+
            'from mst_ledger_account a, mst_department b, mst_department c, ref_ledger_account_type d '+
            'where a.dept_id = b.id '+
            'and a.cost_center_id = c.id '+
            'and a.account_type_id = d.id '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getCoa', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select a.id, a.code, a.name, a.short_name, a.description, a.status, a.account_type_id, d.name as account_type_name, '+
              'a.report_level, a.dept_id, b.name as dept_name, a.cost_center_id, c.name as cost_center_name '+
            'from mst_ledger_account a, mst_department b, mst_department c, ref_ledger_account_type d '+
            'where a.dept_id = b.id '+
            'and a.cost_center_id = c.id '+
            'and a.account_type_id = d.id '+where
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createCoa', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_ledger_account SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status,
            report_level: req.body.report_level,
            dept_id: req.body.dept_id,
            cost_center_id: req.body.cost_center_id,
            account_type_id: req.body.account_type_id
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateCoa', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_ledger_account SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status,
            report_level: req.body.report_level,
            dept_id: req.body.dept_id,
            cost_center_id: req.body.cost_center_id,
            account_type_id: req.body.account_type_id
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteCoa', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_ledger_account where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
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
