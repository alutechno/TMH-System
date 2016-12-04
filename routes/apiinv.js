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
        res.send('API Inventory, access user is:'+JSON.stringify(req.username))
    });

    app.get('/getProductCategories', function (req, res) {
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

        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_category '+where

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

    app.get('/getProductCategory', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_category '+where
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

    app.post('/createProductCategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_product_category SET ?'
        var sqlparam = {
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

    app.post('/updateProductCategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_product_category SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
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

    app.post('/deleteProductCategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_product_category where id='+req.body.id
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

    app.get('/getProductUnits', function (req, res) {
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

        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_unit '+where

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

    app.get('/getProductUnit', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_unit '+where
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

    app.post('/createProductUnit', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_product_unit SET ?'
        var sqlparam = {
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

    app.post('/updateProductUnit', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_product_unit SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
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

    app.post('/deleteProductUnit', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_product_unit where id='+req.body.id
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

    app.get('/getSuppliers', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        var whereArr = []
        if (req.query.id){
            //where += ' where id='+req.query.id
            whereArr.push('id='+req.query.id)
        }
        if (req.query.customSearch.length>0){
            whereArr.push('a.name="'+req.query.customSearch + '" ')
            //where += ' where a.name="'+req.query.customSearch + '" '
        }
        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id,a.code,a.name,a.short_name,a.description,a.status,a.address, '+
            	'a.country_id, b.name as country_name, '+
                'a.prov_id, c.name as prov_name,  '+
                'a.kab_id, d.name as kab_name, '+
                'a.kec_id, e.name as kec_name, '+
                'a.kel_id, f.name as kel_name '+
            'from mst_supplier a '+
            'LEFT JOIN ref_country b '+
            'on a.country_id = b.id '+
            'LEFT JOIN ref_province c '+
            'on a.prov_id = c.id '+
            'LEFT JOIN ref_kabupaten d '+
            'on a.kab_id = d.id '+
            'LEFT JOIN ref_kecamatan e '+
            'on a.kec_id = e.id '+
            'LEFT JOIN ref_kelurahan f '+
            'on a.kel_id = f.id '+where

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

    app.get('/getSupplier', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where a.id='+req.query.id
        }
        var sqlstr = 'select a.id,a.code,a.name,a.short_name,a.description,a.status,a.address, '+
            	'a.country_id, b.name as country_name, '+
                'a.prov_id, c.name as prov_name,  '+
                'a.kab_id, d.name as kab_name, '+
                'a.kec_id, e.name as kec_name, '+
                'a.kel_id, f.name as kel_name '+
            'from mst_supplier a '+
            'LEFT JOIN ref_country b '+
            'on a.country_id = b.id '+
            'LEFT JOIN ref_province c '+
            'on a.prov_id = c.id '+
            'LEFT JOIN ref_kabupaten d '+
            'on a.kab_id = d.id '+
            'LEFT JOIN ref_kecamatan e '+
            'on a.kec_id = e.id '+
            'LEFT JOIN ref_kelurahan f '+
            'on a.kel_id = f.id '+where
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

    app.post('/createSupplier', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_supplier SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status,
            address: req.body.address,
            country_id: req.body.country_id,
            prov_id: req.body.prov_id,
            kab_id: req.body.kab_id,
            kec_id: req.body.kec_id,
            kel_id: req.body.kel_id
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

    app.post('/updateSupplier', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_supplier SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status,
            address: req.body.address,
            country_id: req.body.country_id,
            prov_id: req.body.prov_id,
            kab_id: req.body.kab_id,
            kec_id: req.body.kec_id,
            kel_id: req.body.kel_id
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

    app.post('/deleteSupplier', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_supplier where id='+req.body.id
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

    app.get('/getProducts', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        var whereArr = []
        if (req.query.id){
            //where += ' where id='+req.query.id
            whereArr.push('id='+req.query.id)
        }
        if (req.query.customSearch.length>0){
            whereArr.push('a.name="'+req.query.customSearch + '" ')
            //where += ' where a.name="'+req.query.customSearch + '" '
        }
        if (whereArr.length>0) where = 'and '+whereArr.join(' and ')

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id, a.code, a.barcode, a.name, a.description, a.status, a.is_pr, a.is_ml, '+
              'a.category_id, b.name as category_name, a.unit_type_id, c.name as unit_name, a.available_stock '+
            'from mst_product a, ref_product_category b, ref_product_unit c '+
            'where a.category_id = b.id '+
            'and a.unit_type_id = c.id '+where

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

    app.get('/getProduct', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select a.id, a.code, a.barcode, a.name, a.description, a.status, a.is_pr, a.is_ml, '+
              'a.category_id, b.name as category_name, a.unit_type_id, c.name as unit_name, a.available_stock '+
            'from mst_product a, ref_product_category b, ref_product_unit c '+
            'where a.category_id = b.id '+
            'and a.unit_type_id = c.id '+where
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

    app.post('/createProduct', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_product SET ?'
        var sqlparam = {
            code:req.body.code,
            barcode:req.body.barcode,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            is_pr: req.body.is_pr,
            is_ml: req.body.is_ml,
            category_id: req.body.category_id,
            unit_type_id: req.body.unit_type_id,
            available_stock: req.body.available_stock
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

    app.post('/updateProduct', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_product SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            barcode:req.body.barcode,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            is_pr: req.body.is_pr,
            is_ml: req.body.is_ml,
            category_id: req.body.category_id,
            unit_type_id: req.body.unit_type_id,
            available_stock: req.body.available_stock
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

    app.post('/deleteProduct', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_product where id='+req.body.id
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
