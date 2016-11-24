var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
    });

    app.get('/getCustomers', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

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

    app.get('/getCustomer', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where customer_id='+req.query.id
        }
        var sqlstr = 'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active,'+
            ' customer_is_customer as isCustomer, customer_is_supplier as isSupplier '+
            ' from customer where customer_is_customer = 1 '+where
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

    app.post('/createCustomer', function(req,res){
        console.log(req.body);
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

    app.post('/updateCustomer', function(req,res){
        console.log(req.body);
        var sqlstr = 'update customer SET ? WHERE customer_id=' +req.body.id
        console.log(sqlstr)
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

    app.post('/deleteCustomer', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from customer where customer_id="'+req.body.id+'"'
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

    app.get('/getCustomerContracts', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

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

    app.get('/getCustomerContract', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where a.customer_id='+req.query.id
        }
        var sqlstr = 'select b.cust_contract_id,b.customer_id,a.customer_name,b.cust_contract_from,b.cust_contract_to '+
            ' from customer a, customer_contract b '+
            ' where a.customer_id = b.customer_id ' +where
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

    app.post('/createCustomerContract', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into customer_contract SET ?'
        var sqlparam = {
            cust_contract_id:req.body.code,
            customer_id:req.body.customerId,
            cust_contract_from:req.body.startDate,
            cust_contract_to: req.body.endDate
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

    app.post('/updateCustomerContract', function(req,res){
        console.log(req.body);
        var sqlstr = 'update customer_contract SET ? WHERE cust_contract_id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            customer_id:req.body.customerId,
            cust_contract_from:req.body.startDate,
            cust_contract_to: req.body.endDate
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

    app.post('/deleteCustomerContract', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from customer_contract where cust_contract_id="'+req.body.id+'"'
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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
