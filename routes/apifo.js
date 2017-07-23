var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
    });

    app.get('/getCustomers', function (req, res) {
        //Handle Request From Angular DataTables
        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' and a.id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name="'+req.query.customSearch + '" '
        }

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active'+
            ' from customer where customer_is_customer = 1 '+where

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
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

    app.get('/getCustomer', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and customer_id="'+req.query.id+'"'
        }
        var sqlstr = 'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active,'+
            ' customer_is_customer as isCustomer, customer_is_supplier as isSupplier '+
            ' from customer where customer_is_customer = 1 '+where
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

    app.post('/createCustomer', function(req,res){
        'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active'
        var sqlstr = 'insert into customer SET ?'
        var sqlparam = {
            customer_id:req.body.code,
            customer_name:req.body.name,
            customer_type:req.body.type,
            customer_address: req.body.address,
            customer_city: req.body.city,
            customer_postal_code: req.body.postal,
            customer_state: req.body.state,
            customer_country: req.body.country,
            customer_website: req.body.website,
            customer_phone: req.body.phone,
            customer_mobile: req.body.mobile,
            customer_fax: req.body.fax,
            customer_email: req.body.email,
            customer_tax_id: req.body.tax,
            customer_active: req.body.active,
            customer_is_customer: req.body.isCustomer,
            customer_is_supplier: req.body.isSupplier
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

    app.post('/updateCustomer', function(req,res){
        var sqlstr = 'update customer SET ? WHERE customer_id=' +req.body.id
        var sqlparam = {
            customer_name:req.body.name,
            customer_type:req.body.type,
            customer_address: req.body.address,
            customer_city: req.body.city,
            customer_postal_code: req.body.postal,
            customer_state: req.body.state,
            customer_country: req.body.country,
            customer_website: req.body.website,
            customer_phone: req.body.phone,
            customer_mobile: req.body.mobile,
            customer_fax: req.body.fax,
            customer_email: req.body.email,
            customer_tax_id: req.body.tax,
            customer_active: req.body.active,
            customer_is_customer: req.body.isCustomer,
            customer_is_supplier: req.body.isSupplier
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

    app.post('/deleteCustomer', function(req,res){
        var sqlstr = 'delete from customer where customer_id="'+req.body.id+'"'

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

    app.get('/getCustomerContracts', function (req, res) {
        //Handle Request From Angular DataTables
        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' and a.id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name="'+req.query.customSearch + '" '
        }

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select b.cust_contract_id as id,b.cust_contract_id as code,b.customer_id as customerId,a.customer_name as customerName,b.cust_contract_from as startDate,b.cust_contract_to as endDate '+
            ' from customer a, customer_contract b '+
            ' where a.customer_id = b.customer_id '+where

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
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

    app.get('/getCustomerContract', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and b.cust_contract_id="'+req.query.id+'"'
        }
        var sqlstr = 'select b.cust_contract_id,b.customer_id,a.customer_name,b.cust_contract_from,b.cust_contract_to '+
            ' from customer a, customer_contract b '+
            ' where a.customer_id = b.customer_id ' +where
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

    app.post('/createCustomerContract', function(req,res){
        var sqlstr = 'insert into customer_contract SET ?'
        var sqlparam = {
            cust_contract_id:req.body.code,
            customer_id:req.body.customerId,
            cust_contract_from:req.body.startDate,
            cust_contract_to: req.body.endDate
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

    app.post('/updateCustomerContract', function(req,res){
        var sqlstr = 'update customer_contract SET ? WHERE cust_contract_id="' +req.body.id +'"'
        var sqlparam = {
            customer_id:req.body.customerId,
            cust_contract_from:req.body.startDate,
            cust_contract_to: req.body.endDate
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

    app.post('/deleteCustomerContract', function(req,res){
        var sqlstr = 'delete from customer_contract where cust_contract_id="'+req.body.id+'"'
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

    app.get('/getRoomTypes', function (req, res) {
        //Handle Request From Angular DataTables
        var dtParam = req.query
        var where = '';
        if (req.query.customSearch.length>0){
            where += ' where room_type_name like "%'+req.query.customSearch + '%" '
        }

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        //order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select room_type_id as id,room_type_name as name,room_type_active as active from room_type '+where

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
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

    app.get('/getRoomType', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where room_type_id='+req.query.id
        }
        var sqlstr = 'select room_type_id,room_type_name,room_type_active from room_type '+where
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

    app.post('/createRoomType', function(req,res){
        var sqlstr = 'insert into room_type SET ?'
        var sqlparam = {
            room_type_name:req.body.name,
            room_type_active:req.body.active
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

    app.post('/updateRoomType', function(req,res){
        var sqlstr = 'update room_type SET ? WHERE room_type_id=' +req.body.id
        var sqlparam = {
            room_type_name:req.body.name,
            room_type_active:req.body.active
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

    app.post('/deleteRoomType', function(req,res){
        var sqlstr = 'delete from room_type where room_type_id='+req.body.id

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

    app.get('/getRooms', function (req, res) {
        //Handle Request From Angular DataTables
        var dtParam = req.query
        var where = '';
        if (req.query.customSearch.length>0){
            where += ' and room_name like "%'+req.query.customSearch + '%" '
        }

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        //order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.room_id as id,a.room_id as code, a.room_name as name, a.room_type_id as typeId, a.room_active as active, b.room_type_name as typeName '+
            'from room a, room_type b '+
            'where a.room_type_id = b.room_type_id '+where

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
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

    app.get('/getRoom', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and room_id="'+req.query.id+'"'
        }
        var sqlstr = 'select a.room_id as id,a.room_id as code, a.room_name as name, a.room_type_id as typeId, a.room_active as active, b.room_type_name as typeName '+
            'from room a, room_type b '+
            'where a.room_type_id = b.room_type_id '+where
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

    app.post('/createRoom', function(req,res){
        var sqlstr = 'insert into room SET ?'
        var sqlparam = {
            room_id:req.body.code,
            room_name:req.body.name,
            room_type_id: req.body.typeId,
            room_active: req.body.active
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

    app.post('/updateRoom', function(req,res){
        var sqlstr = 'update room SET ? WHERE room_id="' +req.body.code + '"'
        var sqlparam = {
            room_name:req.body.name,
            room_type_id: req.body.typeId,
            room_active: req.body.active
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

    app.post('/deleteRoom', function(req,res){
        var sqlstr = 'delete from room where room_id="'+req.body.id + '"'

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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
